File System Task Configuration (`fs`)
============================

Overview
--------

The "fs" task is used to perform filesystem operations within your configuration. It allows you to copy files from one location to another within your project. This task is particularly useful when you need to manage project assets, configuration files, or other resources.

Task Properties
---------------

#### `type` (string, required)
Specifies the task type, which should be set to "fs" for this task.

#### `name` (string)
An optional name for the task. If provided, the task state will be saved as a variable.
Visit [Task and Action States](STATES.md) page to learn more.

#### `label` (string)
An optional label or description for the task.

#### `when` (object)
Visit [When](WHEN.md) page to learn how to execute task conditionally.

#### `actions` (array of objects, required)
An array of action items that define the modifications to be made for this task. Each action item contains the following fields:

### Action Item

#### `name` (string)
An optional name for the action. If provided, the action state will be saved as a variable.
Visit [Task and Action States](STATES.md) page to learn more.

#### `when` (object)
Visit [When](WHEN.md) page to learn how to execute action conditionally.

#### `copyFile` (string)
A string that specifies the name of the file you want to copy.

#### `message` (string)
A string that serves as the user prompt message when collecting input. If provided, this message will replace the default message.

#### `destination` (string, required)
A relative path from the project's root directory specifying the destination where the file will be copied. This field determines where the copied file will be placed within your project's directory structure.

Usage Example
-------------

Here's an example of how to use the "fs" task in a configuration file:

```yaml
tasks:
- type: fs
  actions:
    - copyFile: "example.txt"
      message: "Please enter the path of the file you want to copy:"
      destination: "assets/example.txt"
```

In this example:

-   We define an "fs" task to copy a file named "example.txt".

-   We customize the user prompt message to request the path of the file to copy.

-   The `destination` field specifies that the file should be copied to the "assets/example.txt" path within the project's root.

Conclusion
----------

The "fs" task simplifies filesystem operations in your configuration. You can use it to copy files and manage resources within your project effortlessly. Whether you need to include assets or configuration files, the "fs" task streamlines the process of organizing and copying files to the desired locations within your project.
