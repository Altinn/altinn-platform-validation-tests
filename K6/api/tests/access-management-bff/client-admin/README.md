# Client administration

`open-client-admin.js` replays what the browser does when the client administration page opens:
rightholders and connections, agents, clients and the delegation checks. It is a performance
test, the point is the total cost of opening the page.

Test data is `access-management-bff/client-admin/open-client-admin/<env>.csv`. Needs
`ENVIRONMENT` and `AM_UI_BASE_URL`.
