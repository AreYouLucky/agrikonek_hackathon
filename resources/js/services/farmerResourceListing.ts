import axios from 'axios';

export type ResourcePriceAnalysisInput = {
    name: string;
    weight: number;
    harvested_at: string;
    preservation_method: string;
    price: number;
    farmer_location: string | null;
    market_area: string | null;
    market_average: number | null;
    market_minimum: number | null;
    market_maximum: number | null;
};

export async function requestResourcePriceRecommendation(
    resourceId: number,
    signal: AbortSignal,
): Promise<unknown> {
    const response = await axios.post<unknown>(
        route('farmer.resource-price-recommendation'),
        { agri_resource_id: resourceId },
        {
            signal,
            withCredentials: true,
            withXSRFToken: true,
            headers: { Accept: 'application/json' },
        },
    );

    return response.data;
}

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
