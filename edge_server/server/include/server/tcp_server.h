#pragma once
#include <boost/asio.hpp>
#include <memory>
#include <string>
#include <unordered_map>
#include "connection.h"

namespace edge
{

    class TcpServer
    {
    public:
        TcpServer(boost::asio::io_context &io_context, unsigned short port);
        ~TcpServer();

        void start();
        void stop();

    private:
        void startAccept();
        void handleAccept(const boost::system::error_code &error, ConnectionPtr connection);

        boost::asio::io_context &io_context_;
        boost::asio::ip::tcp::acceptor acceptor_;
        std::unordered_map<std::string, ConnectionPtr> connections_;
        bool running_;
    };

} // namespace edge