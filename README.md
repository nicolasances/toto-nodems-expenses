This microservice exposes all informations related to Payments registered in Toto.
 
## Endpoints
### Create Monthly Expenses
`POST /job/monthlyex`

This API Endpoint is used to duplicate all expenses of the previous month that have been defined as **monthly recurring**. These expenses have a flag `monthly = true`. 

This API Endpoint can be triggered by any API client, but has been specifically thought to be automated through a *Cloud Scheduler* Job in GCP. <br>
The Cloud Scheduler can be setup like this: 
 * Creating a job with frequency `0 5 1 * *` (runs on the 1st of every month at 5:00 AM), with timezone CEST
 * Configure the trigger as: 
    * Target Type `HTTP`
    * URL `https://<toto-nodems-expenses API root endpoint>/job/monthlyex`
    * HTTP Method `POST`
    * HTTP Headers (**very important**): 
        * `x-client` set to `totoMoneyWeb`
        * `x-correlation-id` set to anything
    * Auth Header added as `OIDC token` with service account `toto-cloud-scheduler` and audience the one configured in GCP Credentials for the client `totoMoneyWeb`

This needs a Service Account configured that is called `toto-cloud-scheduler` and that has the following permissions: 
 * `Cloud Run Invoker`