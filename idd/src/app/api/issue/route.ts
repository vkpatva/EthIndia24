import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // console.log(searchParams);
    //todo: uncomment
    // const name = searchParams.get('name');
    // const dob = searchParams.get('dob');
    // const address = searchParams.get('address');
    // const city = searchParams.get('city');
    // const pincode = searchParams.get('pincode');

    console.log(searchParams)

    try {

        const url =
            process.env.ISSUER_URL as string + "/v2/identities/did:iden3:polygon:amoy:xC3kP1H11c5EpKrmHXXKSEmkaeim3anmEq8nxcwMd/credentials/links";
        const headers = {
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
            Authorization: process.env.ISSUER__AUTH_TOKEN as string,
            "Content-Type": "application/json",
            Origin: "https://issuer5-ui.zkred.tech",
        };

        // const formatDate = (dateStr: string) => {
        //     if (!dateStr) return "2000-01-01";
        //     const [day, month, year] = dateStr.split("-");
        //     return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        // };
        const body = {
            credentialExpiration: null,

            credentialSubject: {
                name: "Ajay Srivastav",
                dob: "1999-01-01",
                address: "F-1202, KT Nagar, Abu Road , Rajasthan",
                pincode: "389991",
                city: "Abu",
            },
            //todo : uncomment
            // credentialSubject: {
            //     name: name,
            //     dob: formatDate(dob as string),
            //     address: address,
            //     pincode: pincode,
            //     city: city,
            // },
            expiration: null,
            limitedClaims: null,
            mtProof: false,
            refreshService: null,
            schemaID: "0ee1821d-326f-4a71-898a-ee3d708f4f01",
            signatureProof: true,
        };
        console.log(body, url, headers);
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const linkId = data.id;
        console.log(data);
        const offerResponse = await fetch(`${url}/${linkId}/offer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const offerData = await offerResponse.json();

        return NextResponse.json({
            deepLink: offerData.deepLink,
            universalLink: offerData.universalLink,
        });



    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}