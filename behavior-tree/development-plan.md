# Development Plan

1. Rename panel to `behavior-tree` across the directory
2. Break out BehaviorTree component into a separate file so that it can be easily tested against. Should only render the basic behavior tree string for now.
3. Review https://docs.foxglove.dev/docs/extensions/extension-api. Setup Foxglove subscription logic at top level as a setting. Create new setting `behaviorTreeXmlTopic` which sets a state variable string `behaviorTreeXml` that is passed down to `<BehaviorTree xml={behaviorTreeXml} />
4. Initialize a storybook setup against the `<BehaviorTree />` component that lets us mock out the `xml` component. Import @behavior-tree/example_xml.txt into this component. Confirm that you can run storybook successfully.
5. Add a tailwindcss setup.
6. Now lets build an XML / behavior tree parser that is pure Typescript (no react). First


## Features

- Should render a graph structure
- Should allow you to download raw xml
