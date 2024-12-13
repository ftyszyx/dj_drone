#include "server/tcp_server.h"
#include <iostream>

namespace edge
{

    TcpServer::TcpServer(boost::asio::io_context &io_context, unsigned short port)
        : io_context_(io_context), acceptor_(io_context, boost::asio::ip::tcp::endpoint(boost::asio::ip::tcp::v4(), port)), running_(false)
    {
    }

    TcpServer::~TcpServer()
    {
        stop();
    }

    void TcpServer::start()
    {
        running_ = true;
        startAccept();
        std::cout << "Server started" << std::endl;
    }

    void TcpServer::stop()
    {
        running_ = false;
        acceptor_.close();
        for (auto &conn : connections_)
        {
            conn.second->stop();
        }
        connections_.clear();
    }

    void TcpServer::startAccept()
    {
        ConnectionPtr new_connection = std::make_shared<Connection>(io_context_);

        acceptor_.async_accept(new_connection->socket(),
                               [this, new_connection](const boost::system::error_code &error)
                               {
                                   handleAccept(error, new_connection);
                               });
    }

    void TcpServer::handleAccept(const boost::system::error_code &error, ConnectionPtr connection)
    {
        if (!error)
        {
            std::string conn_id = std::to_string(connection->socket().remote_endpoint().port());
            connections_[conn_id] = connection;
            connection->start();

            std::cout << "New connection accepted: " << conn_id << std::endl;
        }

        if (running_)
        {
            startAccept();
        }
    }

} // namespace edge