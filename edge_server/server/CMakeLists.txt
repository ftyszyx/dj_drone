cmake_minimum_required(VERSION 3.10)
project(edge_server)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Boost REQUIRED COMPONENTS system)
find_package(Protobuf REQUIRED)

# 设置 proto 文件目录
set(PROTO_FILES_DIR ${CMAKE_CURRENT_SOURCE_DIR}/proto)

# 设置生成文件的输出目录
set(PROTO_GEN_DIR ${CMAKE_CURRENT_BINARY_DIR}/generated)
file(MAKE_DIRECTORY ${PROTO_GEN_DIR})

# Proto files
set(PROTO_FILES
    ${PROTO_FILES_DIR}/message.proto
)

# 生成 protobuf 文件
protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS 
    ${PROTO_FILES}
)

# 将生成的头文件目录添加到包含路径
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_BINARY_DIR}  # 为生成的 .pb.h 文件
    ${Boost_INCLUDE_DIRS}
    ${Protobuf_INCLUDE_DIRS}
)

# 显示生成的文件路径（调试用）
message(STATUS "Proto sources: ${PROTO_SRCS}")
message(STATUS "Proto headers: ${PROTO_HDRS}")

# Source files
file(GLOB_RECURSE SOURCES 
    "src/*.cpp"
    "src/server/*.cpp"
)

# Create executable
add_executable(${PROJECT_NAME} 
    ${SOURCES}
    ${PROTO_SRCS}
    ${PROTO_HDRS}
)

# Link libraries
target_link_libraries(${PROJECT_NAME}
    ${Boost_LIBRARIES}
    ${Protobuf_LIBRARIES}
    pthread
)