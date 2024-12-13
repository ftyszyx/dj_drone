#include "server/edge_server.h"
#include <iostream>
#include <thread>

namespace edge
{
    EdgeServer::EdgeServer(const std::string &address, unsigned short port)
        : tcp_server_(std::make_unique<TcpServer>(io_context_, port)), running_(false)
    {
        setupMessageHandlers();
    }

    EdgeServer::~EdgeServer()
    {
        stop();
    }

    void EdgeServer::start()
    {
        if (running_)
            return;

        running_ = true;
        tcp_server_->start();

        // 启动事件循环
        std::vector<std::thread> threads;
        const int thread_count = std::thread::hardware_concurrency();

        // 创建工作线程池
        for (int i = 0; i < thread_count; ++i)
        {
            threads.emplace_back([this]()
                                 { io_context_.run(); });
        }

        std::cout << "Edge server started with " << thread_count << " threads" << std::endl;

        // 等待所有线程完成
        for (auto &thread : threads)
        {
            thread.join();
        }
    }

    void EdgeServer::stop()
    {
        if (!running_)
            return;

        running_ = false;
        tcp_server_->stop();
        io_context_.stop();
    }

    void EdgeServer::setupMessageHandlers()
    {
        // 在这里注册消息处理器
        auto message_handler = std::make_shared<MessageHandler>();

        // 处理无人机状态消息
        message_handler->registerHandler(
            proto::MessageType::DRONE_STATUS,
            [this](const proto::Message &msg)
            {
                if (msg.has_drone_status())
                {
                    handleDroneStatus(msg.drone_status());
                }
            });

        // 处理图像数据消息
        message_handler->registerHandler(
            proto::MessageType::IMAGE_DATA,
            [this](const proto::Message &msg)
            {
                if (msg.has_image_data())
                {
                    handleImageData(msg.image_data());
                }
            });

        // 处理异常报告消息
        message_handler->registerHandler(
            proto::MessageType::ANOMALY_REPORT,
            [this](const proto::Message &msg)
            {
                if (msg.has_anomaly())
                {
                    handleAnomalyReport(msg.anomaly());
                }
            });

        // 设置消息处理器
        tcp_server_->setMessageHandler(message_handler);
    }

    void EdgeServer::handleDroneStatus(const proto::DroneStatus &status)
    {
        std::cout << "Received drone status:" << std::endl;
        std::cout << "  Battery: " << status.battery_percent() << "%" << std::endl;
        std::cout << "  Position: " << status.latitude() << ", "
                  << status.longitude() << ", " << status.altitude() << std::endl;
        std::cout << "  Flight mode: " << status.flight_mode() << std::endl;
    }

    void EdgeServer::handleImageData(const proto::ImageData &image_data)
    {
        std::cout << "Received image data:" << std::endl;
        std::cout << "  Timestamp: " << image_data.timestamp() << std::endl;
        std::cout << "  Format: " << image_data.format() << std::endl;
        std::cout << "  Size: " << image_data.image().size() << " bytes" << std::endl;

        // TODO: 处理图像数据，例如保存到文件或进行图像分析
    }

    void EdgeServer::handleAnomalyReport(const proto::AnomalyReport &anomaly)
    {
        std::cout << "Received anomaly report:" << std::endl;
        std::cout << "  Timestamp: " << anomaly.timestamp() << std::endl;
        std::cout << "  Type: " << anomaly.type() << std::endl;
        std::cout << "  Confidence: " << anomaly.confidence() << std::endl;
        std::cout << "  Description: " << anomaly.description() << std::endl;

        // TODO: 处理异常报告，例如发送警报或记录日志
    }

} // namespace edge