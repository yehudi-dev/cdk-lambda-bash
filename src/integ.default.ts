import * as path from 'path';
import {
  App, Stack, Duration,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { BashExecFunction } from '.';


export class IntegTesting {
  readonly stack: Stack[];
  constructor() {
    const devEnv = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    const app = new App();

    const stack = new Stack(app, 'lambda-bash-dev', { env: devEnv });

    const fn = new BashExecFunction(stack, 'Demo', {
      script: path.join(__dirname, '../demo.sh'),
      dockerfile: path.join(__dirname, '../Dockerfile'),
      timeout: Duration.minutes(2),
      environment: {
        FOO: 'BAR',
      },
    });

    fn.run({ runOnUpdate: true });

    app.synth();
    this.stack = [stack];
  }
}

export class IntegTestingCustomRole {
  readonly stack: Stack[];
  constructor() {
    const devEnv = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    const app = new App();

    const stack = new Stack(app, 'lambda-bash-dev', { env: devEnv });

    const role = new iam.Role(stack, 'CustomRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    const fn = new BashExecFunction(stack, 'Demo', {
      script: path.join(__dirname, '../demo-custom-role.sh'),
      dockerfile: path.join(__dirname, '../Dockerfile'),
      timeout: Duration.minutes(2),
      role,
    });

    fn.run({ runOnUpdate: true });

    app.synth();
    this.stack = [stack];
  }
}

new IntegTesting();
// new IntegTestingCustomRole();


