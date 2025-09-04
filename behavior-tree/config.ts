// Copyright (c) 2025-present Polymath Robotics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
module.exports = {
  webpack: (config) => {
    // Filter out the existing css rule so css-loader isn't included twice
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "src"),
    };

    config.module.rules = config.module.rules.filter((rule) => !rule?.use?.includes("css-loader"));
    config.module.rules.push({
      test: /\.css$/i,
      use: ["style-loader", "css-loader", "postcss-loader"],
    });
    return config;
  },
};
