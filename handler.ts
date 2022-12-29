'use strict';
import { Octokit } from "octokit";

module.exports.hello = async (event) => {
    const payload = JSON.parse(event.body);
    if (payload.action !== 'opened') {
        // we don't care about this (yet)
        return {
            statusCode: 200
        }
    }
    if (
        // for testing
        // payload.pull_request.title === 'ignore' ||
        (
            payload.pull_request.head.ref === 'master' ||
            payload.pull_request.head.ref === 'main'
        ) &&
        payload.pull_request.base.ref === 'production' &&
        payload.pull_request.user.login !== process.env.GH_USER
    ) {
        const octokit = new Octokit({
            auth: process.env.GH_TOKEN,
            userAgent: 'gh-approve',
        });
        const {
            data: { login },
        } = await octokit.rest.users.getAuthenticated();
        await octokit.rest.pulls.createReview({
            event: 'APPROVE',
            pull_number: payload.pull_request.number,
            owner: payload.pull_request.head.repo.owner.login,
            repo: payload.pull_request.head.repo.name,
            body: 'Approved by totally a human',
        });
    }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'done',
      },
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
