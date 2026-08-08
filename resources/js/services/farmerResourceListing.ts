import axios from 'axios';

export type ResourcePriceAnalysisInput = {
    name: string;
    weight: number;
    harvested_at: string;
    preservation_method: string;
    price: number;
};

export async function requestResourceBuyerSuggestions(
    resourceId: number,
): Promise<unknown> {
    const response = await axios.post<unknown>(
        route('farmer.resource-buyer-suggestions'),
        { agri_resource_id: resourceId },
        {
            withCredentials: true,
            withXSRFToken: true,
            headers: { Accept: 'application/json' },
        },
    );

    return response.data;
}

export async function requestResourcePriceAnalysis(
    input: ResourcePriceAnalysisInput,
): Promise<unknown> {
    const response = await axios.post<unknown>(
        route('ai.analyze-crop-price'),
        input,
        {
            withCredentials: true,
            withXSRFToken: true,
            headers: { Accept: 'application/json' },
        },
    );

    return response.data;
}
