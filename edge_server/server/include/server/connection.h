#pragma once
#include <boost/asio.hpp>
#include <memory>
#include <string>
#include <queue>
#include <mutex>
#include "message.pb.h"
#include "message_handler.h"

namespace edge
{

    class Connection;
    using ConnectionPtr = std::shared_ptr<Connection>;

    class Connection : public std::enable_shared_from_this<Connection>
    {
    public:
        explicit Connection(boost::asio::io_context &io_context);
        ~Connection();

        boost::asio::ip::tcp::socket &socket();
        void start();
        void stop();
        void sendMessage(const proto::Message &message);

    private:
        void handleRead(const boost::system::error_code &error, size_t bytes_transferred);
        void handleWrite(const boost::system::error_code &error);
        void doWrite();

        boost::asio::ip::tcp::socket socket_;
        enum
        {
            max_length = 1024 * 1024
        }; // 增大缓冲区以适应protobuf消息
        char data_[max_length];
        std::queue<std::string> write_messages_;
        std::mutex write_mutex_;
        bool writing_;
        std::shared_ptr<MessageHandler> message_handler_;
    };

} // namespace edge