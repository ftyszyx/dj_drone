#include "server/connection.h"
#include <iostream>

namespace edge
{
    Connection::Connection(boost::asio::io_context &io_context)
        : socket_(io_context), writing_(false), message_handler_(std::make_shared<MessageHandler>())
    {
    }

    Connection::~Connection()
    {
        stop();
    }

    boost::asio::ip::tcp::socket &Connection::socket()
    {
        return socket_;
    }

    void Connection::start()
    {
        // 开始读取消息头（4字节的消息长度）
        boost::asio::async_read(socket_,
                                boost::asio::buffer(data_, sizeof(uint32_t)),
                                [self = shared_from_this()](const boost::system::error_code &error, size_t /*bytes_transferred*/)
                                {
                                    if (!error)
                                    {
                                        uint32_t message_size;
                                        memcpy(&message_size, self->data_, sizeof(message_size));

                                        // 读取消息体
                                        self->readMessage(message_size);
                                    }
                                    else
                                    {
                                        self->stop();
                                    }
                                });
    }

    void Connection::stop()
    {
        if (socket_.is_open())
        {
            boost::system::error_code ec;
            socket_.shutdown(boost::asio::ip::tcp::socket::shutdown_both, ec);
            socket_.close();
        }
    }

    void Connection::sendMessage(const proto::Message &message)
    {
        std::string serialized_data;
        if (!message.SerializeToString(&serialized_data))
        {
            std::cerr << "Failed to serialize message" << std::endl;
            return;
        }

        // 准备发送数据（长度 + 消息内容）
        uint32_t message_size = serialized_data.size();
        std::string complete_message;
        complete_message.reserve(sizeof(message_size) + message_size);

        // 添加消息长度头
        complete_message.append(reinterpret_cast<const char *>(&message_size), sizeof(message_size));
        // 添加消息内容
        complete_message.append(serialized_data);

        {
            std::lock_guard<std::mutex> lock(write_mutex_);
            bool write_in_progress = !write_messages_.empty();
            write_messages_.push(std::move(complete_message));

            if (!write_in_progress)
            {
                doWrite();
            }
        }
    }

private:
    void readMessage(uint32_t message_size)
    {
        if (message_size > max_length)
        {
            std::cerr << "Message size too large: " << message_size << std::endl;
            stop();
            return;
        }

        // 读取消息体
        boost::asio::async_read(socket_,
                                boost::asio::buffer(data_, message_size),
                                [self = shared_from_this(), message_size](const boost::system::error_code &error, size_t /*bytes_transferred*/)
                                {
                                    if (!error)
                                    {
                                        // 解析消息
                                        proto::Message message;
                                        if (message.ParseFromArray(self->data_, message_size))
                                        {
                                            // 处理消息
                                            self->message_handler_->handleMessage(message);
                                        }
                                        else
                                        {
                                            std::cerr << "Failed to parse message" << std::endl;
                                        }

                                        // 继续读取下一个消息
                                        self->start();
                                    }
                                    else
                                    {
                                        self->stop();
                                    }
                                });
    }

    void doWrite()
    {
        if (write_messages_.empty())
        {
            writing_ = false;
            return;
        }

        writing_ = true;
        boost::asio::async_write(socket_,
                                 boost::asio::buffer(write_messages_.front()),
                                 [self = shared_from_this()](const boost::system::error_code &error, size_t /*bytes_transferred*/)
                                 {
                                     if (!error)
                                     {
                                         std::lock_guard<std::mutex> lock(self->write_mutex_);
                                         self->write_messages_.pop();
                                         self->doWrite();
                                     }
                                     else
                                     {
                                         self->stop();
                                     }
                                 });
    }
};

} // namespace edge