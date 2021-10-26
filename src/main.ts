
import * as fs from 'fs'

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import { ReleaseCreatedEvent } from '@octokit/webhooks-types'


async function run(): Promise<void> {
  if (!process.env.GITHUB_EVENT_PATH) {
    core.setFailed('action does not have the $GITHUB_EVENT_PATH env variable')
    return
  }

  let name = core.getInput('name')
  let source = core.getInput('source')
  core.info(`* Build Go source for ${name} from: ${source}`)
  await exec.exec('go', ['build', '-v', '-o', name, source], {
    env: {
      ...process.env,
      GOOS: 'linux',
      GOARCH: 'amd64',
    },
  })

  let octokit = github.getOctokit(core.getInput('token'))

  let event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf-8')) as ReleaseCreatedEvent

  core.info('* Upload binary to GitHub release')
  await octokit.request({
    method: 'POST',
    url: event.release.upload_url,
    headers: { 'Content-Type': 'application/gzip' },
    data: fs.readFileSync(name, 'binary'),
    name: `${name}_${event.release.tag_name}_linux_amd64`,
  })
}

async function main(): Promise<void> {
  try {
    await run()
  } catch (err) {
    core.setFailed(`Action failed with error: ${err}`)
  }
}

main()
