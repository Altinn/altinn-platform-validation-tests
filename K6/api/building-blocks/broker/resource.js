export function GetResource(
    resourceClient,
    resourceId,
    labels = null,
) {
    const res = resourceClient.GetResource(
        resourceId,
        labels,
    );

    /** @type {ResourceExt|null} */
    let resource = null;

    const succeed = check(res, {
        "GetResource - status code is 200": (r) => r.status === 200,
        "GetResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "GetResource - body is valid": (r) => {
            try {
                resource = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return resource;
}
