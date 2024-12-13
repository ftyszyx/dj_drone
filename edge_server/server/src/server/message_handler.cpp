#include "server/message_handler.h"
#include <chrono>

namespace edge
{

    MessageHandler::MessageHandler() : sequence_counter_(0) {}

    void MessageHandler::registerHandler(proto::MessageType type, MessageCallback callback)
    {
        handlers_[type] = std::move(callback);
    }

    void MessageHandler::handleMessage(const proto::Message &message)
    {
        auto it = handlers_.find(message.type());
        if (it != handlers_.end())
        {
            it->second(message);
        }
    }

    proto::Message MessageHandler::createHeartbeat()
    {
        proto::Message message;
        message.set_type(proto::MessageType::HEARTBEAT);
        message.set_sequence(++sequence_counter_);
        message.set_timestamp(std::chrono::system_clock::now().time_since_epoch().count());

        auto *heartbeat = message.mutable_heartbeat();
        heartbeat->set_timestamp(message.timestamp());

        return message;
    }

    proto::Message MessageHandler::createAuthMessage(const std::string &device_id, const std::string &token)
    {
        proto::Message message;
        message.set_type(proto::MessageType::AUTH);
        message.set_sequence(++sequence_counter_);
        message.set_timestamp(std::chrono::system_clock::now().time_since_epoch().count());

        auto *auth = message.mutable_auth();
        auth->set_device_id(device_id);
        auth->set_token(token);

        return message;
    }

    // 实现其他创建消息的方法...

} // namespace edge