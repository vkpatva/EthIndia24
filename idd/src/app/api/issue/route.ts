import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const dob = searchParams.get('dob');
    const gender = searchParams.get('gender');
    const address = searchParams.get('address');
    const city = searchParams.get('city');
    const pincode = searchParams.get('pincode');

    try {
        const credentials = {
            name: name || "Ajay Sharma",
            dob: dob || "2000-01-01",
            gender: gender || "M",
            address: address || "B-101, Ashray, Ahmedabad",
            city: city || "Ahmedabad",
            pincode: pincode || "380001"
        };


        const zkredResponse = await fetch(process.env.ISSUER_URL as string, {
            method: 'POST',
            headers: {
                'Authorization': process.env.ISSUER_HEADER as string,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credentialSubject: {
                    name: credentials.name,
                    dob: credentials.dob,
                    address: credentials.address,
                    pincode: credentials.pincode,
                    city: credentials.city
                },
                schemaID: process.env.SCHEMA_ID as string,
                signatureProof: true,
                mtProof: false,
                limitedClaims: 1,
            })
        });
        console.log(zkredResponse);

        const zkredData = await zkredResponse.json();

        const linkId = zkredData.id;

        console.log(process.env.ISSUER_URL as string);
        const offerResponse = await fetch(`${process.env.ISSUER_URL as string}${linkId}/offer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const offerData = await offerResponse.json();
        return NextResponse.json({
            deepLink: offerData.deepLink,
            universalLink: offerData.universalLink
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}