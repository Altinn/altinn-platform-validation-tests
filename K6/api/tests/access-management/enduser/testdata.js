export function getTestData(env) {
    if (env == "at22") {
        return at22TestData;
    } else if (env == "tt02") {
        return tt02TestData;
    } else {
        throw new Error("Invalid env:", env);
    }
}

const at22TestData = {
    env: "at22",
    instancer: {
        personC_instansid:
            "urn:altinn:instance-id:51604554/4978eb66-35d0-4fc5-bb3b-27ed472172a4",
        personA_instansid:
            "urn:altinn:instance-id:51206777/18afe41c-68f4-4f8d-a11c-d89003614f3f",
        hovedenhetA_instansid:
            "urn:altinn:instance-id:51604554/f685314f-0954-4298-a562-bfcdf3f867ab",
        underenhetD_instansid:
            "urn:altinn:instance-id:51756095/a0e1bce8-22c5-4d53-a869-a420ad106550",
    },
    authParties_personA: {
        lastname: "MILLION",
        pid: "13923047349",
        partyid: 51206777,
        userid: 20961123,
        partyuuid: "c897620a-9375-4e8a-bc2e-8e15382e1333",
    },
    authParties_personB: {
        lastname: "KLEM",
        pid: "07900699128",
        partyid: 50260472,
        userid: 20064050,
        partyuuid: "0ab17c0c-f5cb-48e8-a0c4-4b023889f132",
    },
    authParties_agentB: {
        lastname: "HYBELKANIN",
        pid: "14906198453",
        partyid: 50807487,
        userid: 20276551,
        partyuuid: "37b157f8-0011-496f-8dcc-cdfbd2594da6",
    },
    authParties_hovedenhetA: {
        name: "NATURSTRIDIG TILLITSFULL TIGER AS",
        org_no: "313038963",
        partyid: 51604554,
        partyuuid: "17f1d868-320e-4806-ab51-a36feed8c8cf",
        dagligleder: {
            name: "Morsom Kokeplate",
            pid: "04828399387",
            partyid: 50677787,
            userid: 20051704,
            partyuuid: "0816ed53-0ee8-47cf-958f-a711677ccb74",
        },
        authParties_underenhetA: {
            name: "NATURSTRIDIG TILLITSFULL TIGER AS",
            org_no: "314451821",
            partyid: 51693984,
            partyuuid: "03ec2694-d04c-4409-8dd1-7f6e927c9522",
        },
        authParties_personC: {
            lastname: "BAKGRUNNSLITTERATUR",
            pid: "19810597510",
            partyid: 50148188,
            userid: 20470095,
            partyuuid: "626c7294-dfcd-4509-bbef-f6800719052f",
        },
    },
    authParties_hovedenhetB: {
        name: "KOMPATIBEL VAKLENDE TIGER AS",
        org_no: "312483823",
        partyid: 51565603,
        partyuuid: "257d3b35-b83d-4fef-9324-27d07aca3f76",
        dagligleder: {
            name: "Håndfast Lind",
            pid: "22836699509",
            partyid: 51171378,
            userid: 20285504,
            partyuuid: "399ee1b6-3040-4328-9c2c-9eb027de562d",
        },
        authParties_underenhetB: {
            name: "KOMPATIBEL VAKLENDE TIGER AS",
            org_no: "315123038",
            partyid: 51755016,
            partyuuid: "1370f254-7c35-41f1-8750-bef951cdf830",
        },
    },
    authParties_hovedenhetC: {
        name: "Gjestfri Moderne Tiger AS",
        org_no: "310931608",
        partyid: 51393577,
        partyuuid: "3268e170-de44-430e-9a82-f4b0baeee997",
        dagligleder: {
            name: "Maritim Overskrift",
            pid: "04914399756",
            partyid: 51162744,
            userid: 20466887,
            partyuuid: "61bfd247-3c86-47f5-86b1-47561ba31a4e",
        },
        authParties_underenhetC: {
            name: "Gjestfri Moderne Tiger AS",
            org_no: "311421670",
            partyid: 51448192,
            partyuuid: "a4f30f3b-de7a-44d6-a948-12520d18a510",
        },
    },
    authParties_hovedenhetD: {
        name: "Ultrafiolett Salig Tiger AS",
        org_no: "311720880",
        partyid: 51486331,
        partyuuid: "8745f0be-0657-4e0d-b5af-68e800bc3182",
        dagligleder: {
            name: "Forstandig Million",
            pid: "13817299460",
            partyid: 50938781,
            userid: 20029398,
            partyuuid: "0364a8ed-c4d6-4a91-b0a8-04f7c3c2cd5d",
        },
        authParties_underenhetD: {
            name: "Ultrafiolett Salig Tiger AS",
            org_no: "311720880",
            partyid: 51756095,
            partyuuid: "87eee9b5-5059-4ad0-b220-d312c5f5d5fc",
        },
    },
};

const tt02TestData = {
    env: "tt02",
    instancer: {
        personC_instansid: "urn:altinn:instance-id:51817923/2a8c9ece-c4b8-49f1-ad42-343f0a9f2452",
        personA_instansid: "urn:altinn:instance-id:52054516/bbd5044d-6844-4fd0-bf5e-9dec12b6e29c",
        hovedenhetA_instansid: "urn:altinn:instance-id:51817923/1c5efeba-a22b-4755-bf19-50103d48616a",
        underenhetD_instansid: "urn:altinn:instance-id:51969455/1dde9029-6faf-4fa1-b72d-9c862957d218"
    },

    authParties_personA: {
        lastname: "MILLION",
        pid: "13923047349",
        partyid: 52054516,
        userid: 2195497,
        partyuuid: "a71f8353-b196-4e24-97fe-98898ed48bc7",
    },
    authParties_personB: {
        lastname: "KLEM",
        pid: "07900699128",
        partyid: 51154426,
        userid: 2303333,
        partyuuid: "bf989a29-e10a-48ef-a8db-ed18ad2df66f",
    },
    authParties_agentB: {
        lastname: "HYBELKANIN",
        pid: "14906198453",
        partyid: 50951114,
        userid: 1490338,
        partyuuid: "0791979b-b0ee-4b50-bd23-16a964da925c",
    },
    authParties_hovedenhetA: {
        name: "NATURSTRIDIG TILLITSFULL TIGER AS",
        org_no: "313038963",
        partyid: 51817923,
        partyuuid: "c8d9a10f-db9e-46a5-af3d-05c7b2c2f6ce",
        dagligleder: {
            name: "Morsom Kokeplate",
            pid: "04828399387",
            partyid: 50709183,
            userid: 2103247,
            partyuuid: "9249ad8d-c3c6-49b9-88d4-c2daccc3496c",
        },
        authParties_underenhetA: {
            name: "NATURSTRIDIG TILLITSFULL TIGER AS",
            org_no: "314451821",
            partyid: 51907357,
            partyuuid: "0b90c02f-f815-448a-aad7-f7da0d504aae",
        },
        authParties_personC: {
            lastname: "BAKGRUNNSLITTERATUR",
            pid: "19810597510",
            partyid: 51040604,
            userid: 1519799,
            partyuuid: "0e4904cd-fbd9-44c7-b4a6-eff26b1df709",
        },
    },
    authParties_hovedenhetB: {
        name: "KOMPATIBEL VAKLENDE TIGER AS",
        org_no: "312483823",
        partyid: 51779147,
        partyuuid: "a5ae0479-f354-460d-9c57-5a37149f5a5c",
        dagligleder: {
            name: "Håndfast Lind",
            pid: "22836699509",
            partyid: 51419498,
            userid: 159582,
            partyuuid: "901c0528-c25a-4bc1-935b-d56908ce5669",
        },
        authParties_underenhetB: {
            name: "KOMPATIBEL VAKLENDE TIGER AS",
            org_no: "315123038",
            partyid: 51968376,
            partyuuid: "58d2cb9e-67fc-452d-8b19-4293fb5edcbe",
        },
    },
    authParties_hovedenhetC: {
        name: "Gjestfri Moderne Tiger AS",
        org_no: "310931608",
        partyid: 51607109,
        partyuuid: "1e9df774-975f-437e-ab1e-ebb525f87e62",
        dagligleder: {
            name: "Maritim Overskrift",
            pid: "04914399756",
            partyid: 51410970,
            userid: 2386509,
            partyuuid: "d27d3230-ed6e-484b-afa9-f648f433e183",
        },
        authParties_underenhetC: {
            name: "Gjestfri Moderne Tiger AS",
            org_no: "311421670",
            partyid: 51661739,
            partyuuid: "e589a850-fee1-4738-ad7a-9ae6e11dc137",
        },
    },
    authParties_hovedenhetD: {
        name: "Ultrafiolett Salig Tiger AS",
        org_no: "311720880",
        partyid: 51699868,
        partyuuid: "daa195be-a9d4-4b45-8ca5-7653ab62b990",
        dagligleder: {
            name: "Forstandig Million",
            pid: "13817299460",
            partyid: 51190125,
            userid: 159554,
            partyuuid: "f93ba79c-e35e-45d5-8359-78bad338bbfa",
        },
        authParties_underenhetD: {
            name: "Ultrafiolett Salig Tiger AS",
            org_no: "311720880",
            partyid: 51969455,
            partyuuid: "2feaf4ca-c5d0-47d3-823e-91783b17b97a",
        },
    },
};
