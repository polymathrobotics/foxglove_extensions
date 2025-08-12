# foxglove_extensions
Polymath-custom extensions for Foxglove

### Activating Code Standard Hooks

[Pre-commit](https://pre-commit.com) hooks are provided to maintain code standards for this repository.

1. If you do not have pre-commit installed, run `python3 -m pip install pre-commit`
1. For preexisting repositories, you must run `pre-commit install` in that repository
1. You can automatically install pre-commit for newly cloned repositories by running
    ```
    $ git config --global init.templateDir ~/.git-template
    $ pre-commit init-templatedir ~/.git-template
    pre-commit installed at /home/asottile/.git-template/hooks/pre-commit
    ```

Now all git commits will be automatically gated by the configured checks.
