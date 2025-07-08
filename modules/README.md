# Account Creation Module

This module is responsible for creating user accounts across different social media platforms.

## Features

- Generate random profile data
- Create Facebook accounts
- Manage account profiles

## Classes

- `AccountCreator`: Manages account creation and profile handling.
- `ProfileGenerator`: Provides utility methods to generate profile data.

## Usage

```python
from modules.create import AccountCreator
creator = AccountCreator()
account = creator.create_facebook_account()
```
