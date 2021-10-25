
# go-release.actions

Release Go binaries as GitHub Release assets.


## Usage

```yaml
on: 
  release:
    types: [created]

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master

    - uses: actions/setup-go@v2
      with:
        go-version: 1.14.7

    - uses: altipla-consulting/go-release.actions@main
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        source: ./cmd/mytool
        name: mytool
```
