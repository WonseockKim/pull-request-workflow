import * as core from '@actions/core'
import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generatePullRequestOpenedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>,
  reviewers: string[]
): (KnownBlock | Block)[] => {
  core.info('Generating Pull Request Opened message...')

  const {pull_request, repository} = githubContext.payload
  core.debug(`Pull Request payload: ${JSON.stringify(pull_request)}`)
  core.debug(`Repository payload: ${JSON.stringify(repository)}`)

  const date = new Date(pull_request?.created_at).toLocaleDateString('de-DE', {
    timeZone: 'Europe/Berlin'
  })
  const time = new Date(pull_request?.created_at).toLocaleTimeString('de-DE', {
    timeZone: 'Europe/Berlin'
  })
  core.info(`Formatted date: ${date}, time: ${time}`)

  const pullRequestTitle = `<${pull_request?.html_url}|${pull_request?.title}>`
  core.info(`Pull Request Title: ${pullRequestTitle}`)

  const formattedReviewers = reviewers
    .map((reviewer) => getUserToLog(githubSlackUserMapper, reviewer))
    .join(' | ')
  core.info(`Formatted reviewers: ${formattedReviewers}`)

  const prAuthor = getUserToLog(githubSlackUserMapper, githubContext.actor)
  core.info(`PR Author: ${prAuthor}`)

  const repositoryText = `<${repository.html_url}|${repository.name}>`
  core.info(`Repository: ${repositoryText}`)

  const contextText = `*PR Author:* ${prAuthor} \n*Repository:* ${repositoryText} \n*Created At:* ${date} | ${time} \n*Reviewers:* ${prAuthor} | ${formattedReviewers}`
  core.info(`Context text: ${contextText}`)


  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:boom: *New Pull Request ${pullRequestTitle} is submitted*`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':hourglass_flowing_sand: It is time to add your reviews'
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: ':arrow_right: Review PR',
          emoji: true
        },
        url: `${pull_request?.html_url}/files`,
        action_id: 'button-action'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: contextText
        }
      ]
    }
  ]
}
