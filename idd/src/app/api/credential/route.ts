import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const response = await fetch('https://api-playground.setu.co/api/product-api', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'origin': 'https://api-playground.setu.co',
            },
            body: JSON.stringify({
                "requestObj": {
                    "parameters": {
                        "path": [{
                            "requestId": id
                        }],
                        "header": [
                            { "x-client-id": process.env.CLIENT_ID },
                            { "x-client-secret": process.env.CLIENT_SECRET },
                            { "x-product-instance-id": process.env.PRODUCT_INSTANCE_ID }
                        ]
                    }
                },
                "url": "https://dg-sandbox.setu.co/api/digilocker/{requestId}/aadhaar",
                "requestBooleanData": {
                    "header": true,
                    "path": true,
                    "query": false,
                    "body": false
                },
                "method": "get",
                "operationId": "Gete-AadhaarXML",
                "selectedProduct": {
                    "label": "DigiLocker",
                    "value": "data/digilocker"
                }
            })
        });

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
