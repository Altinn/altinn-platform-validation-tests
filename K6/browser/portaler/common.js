export function getOptions() {

    const options = {
        scenarios: {
            ui: {
                executor: "shared-iterations",
                vus: 5,
                iterations: 100,
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
