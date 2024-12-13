#pragma once
#include "message.pb.h"
#include <functional>
#include <memory>
#include <unordered_map>

namespace edge
{

    class MessageHandler
    {
    public:
        using MessageCallback = std::function<void(const proto::Message &)>;

        MessageHandler();
        ~MessageHandler() = default;

        // 注册消息处理回调
        void registerHandler(proto::MessageType type, MessageCallback callback);

        // 处理收到的消息
        void handleMessage(const proto::Message &message);

        // 创建各种类型的消息
        static proto::Message createHeartbeat();
        static proto::Message createAuthMessage(const std::string &device_id, const std::string &token);
        static proto::Message createDroneStatus(const proto::DroneStatus &status);
        static proto::Message createImageData(const proto::ImageData &image_data);
        static proto::Message createAnomalyReport(const proto::AnomalyReport &anomaly);

    private:
        std::unordered_map<proto::MessageType, MessageCallback> handlers_;
        int64_t sequence_counter_;
    };

} // namespace edge