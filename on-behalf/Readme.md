# Project Setup and Environment Configuration

## Creating the Test Environment

To set up the test environment, follow these steps:

1. Create a `.testenv` file in the root directory of the project.
2. Copy all the environment variables from the `testenv-sample` file.
3. Paste the variables into the `.testenv` file.
4. Assign appropriate values to each variable in `.testenv`.

---

## Starting the Project

You can start the project in one of two ways, depending on your authentication server setup:

### 1. Using the Same Auth Server for Token Exchange

```bash
node server.js
```

### 2. Using a Different Auth Server for Token Exchange

```bash
node server.js -yourTrustedServerIssuerUrl
```