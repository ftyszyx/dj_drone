#pragma once
#include "server/tcp_server.h"
#include <memory>
#include <string>

namespace edge
{
    class EdgeServer
    {
    public:
        EdgeServer(const std::string &address, unsigned short port);
        ~EdgeServer();

        void start();
        void stop();

    private:
        void setupMessageHandlers();
        void handleDroneStatus(const proto::DroneStatus &status);
        void handleImageData(const proto::ImageData &image_data);
        void handleAnomalyReport(const proto::AnomalyReport &anomaly);

        boost::asio::io_context io_context_;
        std::unique_ptr<TcpServer> tcp_server_;
        bool running_;
    };

} // namespace edge