export function getOptions() {

    const options = {
        scenarios: {
            ui: {
                executor: "shared-iterations",
                vus: 5,
                iterations: 10,
                options: {
                    browser: {
                        type: "chromium",
                    },
                },
            },
        },
        thresholds: {},
    };

    return options;
}
