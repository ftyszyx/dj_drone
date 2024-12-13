cmake_minimum_required(VERSION 3.10)
project(edge_server)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Boost REQUIRED COMPONENTS system)
find_package(Protobuf REQUIRED)

# Proto files
set(PROTO_FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/proto/message.proto
)

# Generate protobuf files
protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS ${PROTO_FILES})

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
include_directories(${CMAKE_CURRENT_BINARY_DIR})  # For generated protobuf files
include_directories(${Boost_INCLUDE_DIRS})
include_directories(${Protobuf_INCLUDE_DIRS})

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