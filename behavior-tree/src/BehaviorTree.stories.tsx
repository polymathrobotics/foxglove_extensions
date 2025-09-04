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
import type { Meta, StoryObj } from "@storybook/react";

import { BehaviorTree } from "./BehaviorTree";
// @ts-ignore
import complexXmlData from "./fixtures/behavior-tree.xml?raw";

// Import example XML from the file
const exampleXmlData = {
  data: `<root BTCPP_format="4">
    <BehaviorTree ID="Main_Tree" _fullpath="">
        <ReactiveSequence name="ReactiveSequence" _uid="1">
            <Fallback name="Fallback" _uid="2">
                <IsTrue name="IsTrue" _uid="3" boolean="{initialized}"/>
                <Sequence name="Sequence" _uid="4">
                    <NavSatFixSubscriber name="NavSatFixSubscriber" _uid="5" topic_name="/gps/fix" geopose_stamped="{gps_fix_geopose}"/>
                    <InitializePoseTransformer name="InitializePoseTransformer" _uid="6" geopose_stamped="{gps_fix_geopose}"/>
                    <SetBool name="SetBool" _uid="7" value="true" output="{initialized}"/>
                    <SetBool name="SetBool" _uid="8" value="true" output="{resume_requested}"/>
                </Sequence>
            </Fallback>
        </ReactiveSequence>
    </BehaviorTree>
</root>`,
};

const meta = {
  title: "Components/BehaviorTree",
  component: BehaviorTree,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "1500px", height: "1000px", border: "1px solid #e5e7eb" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BehaviorTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    xml: exampleXmlData.data,
  },
};

export const Empty: Story = {
  args: {
    xml: undefined,
  },
};

export const SimpleTree: Story = {
  args: {
    xml: `<root BTCPP_format="4">
    <BehaviorTree ID="Simple_Tree">
        <Sequence name="MainSequence">
            <Action name="Action1" />
            <Action name="Action2" />
            <Condition name="Check" />
        </Sequence>
    </BehaviorTree>
</root>`,
  },
};

export const ComplexTree: Story = {
  args: {
    xml: complexXmlData,
  },
};
