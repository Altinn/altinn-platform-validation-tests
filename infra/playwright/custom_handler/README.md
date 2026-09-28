https://learn.microsoft.com/en-us/azure/azure-functions/functions-custom-handlers

go build -o handler ./GetReport

func azure functionapp publish playwright-artifacts-function-app

TODO: Need to add code to deploy the functions.

TODO: Need to add code to link preview envs to functions. Terraform only work for the Production env.


az staticwebapp functions link \
  --name <static-web-app-name> \
  --resource-group <resource-group> \
  --function-resource-id <function-resource-id> \
  --environment-name <preview-environment>


When linking, authentication will be configured to restrict your backend to requests from the static web app. Learn more
https://learn.microsoft.com/nb-no/azure/static-web-apps/apis-overview


TODO: It might be worth it to have a sanity check to make sure the endpoints don't become open. They should all return 401

curl -s -o /dev/null -w "%{http_code}\n" --connect-timeout 5 https://playwright-artifacts-function-app-at22.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png
curl -s -o /dev/null -w "%{http_code}\n" --connect-timeout 5 https://playwright-artifacts-function-app-at23.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png
curl -s -o /dev/null -w "%{http_code}\n" --connect-timeout 5 https://playwright-artifacts-function-app-tt02.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png
curl -s -o /dev/null -w "%{http_code}\n" --connect-timeout 5 https://playwright-artifacts-function-app.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png
