
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
  await exec.exec('go', ['build', '-v', '-o', name, source])

  let octokit = github.getOctokit(core.getInput('token'))

  let event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf-8')) as ReleaseCreatedEvent

  core.info('* Upload binary to GitHub release')
  await octokit.rest.repos.uploadReleaseAsset({
    owner: event.repository.owner.login,
    repo: event.repository.name,
    release_id: event.release.id,
    name: `${name}-linux-amd64`,
    data: fs.readFileSync(name) as any,
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
