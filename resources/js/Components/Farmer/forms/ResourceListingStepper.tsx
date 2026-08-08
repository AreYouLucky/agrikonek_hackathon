import { useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CalendarDays,
    Camera,
    Check,
    CheckCircle2,
    MapPin,
    Package,
    PhilippinePeso,
    Recycle,
    Phone,
    Sparkles,
    Sprout,
    TrendingUp,
    Warehouse,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactElement,
    useEffect,
    useRef,
    useState,
} from 'react';

type AgriResource = {
    id: number;
    name: string;
};

type Props = {
    resources: AgriResource[];
};

type FormData = {
    agri_resource_id: string;
    quantity: string;
    harvested_at: string;
    preservation_method: string;
    img: File | null;
    price: string;
};

type PriceRecommendation = {
    recommended_price: number | null;
    average_price: number | null;
    minimum_price: number | null;
    maximum_price: number | null;
    farmer_location: string;
    market_area: string | null;
    market_count: number;
    match_type:
        | 'nearest_location'
        | 'location_match'
        | 'regional_fallback'
        | 'no_market_data';
    message: string;
};

type ProcessorSuggestion = {
    id: number;
    business_name: string;
    business_type: string;
    complete_address: string;
    contact_number: string;
    distance_km: number | null;
    has_bought_resource: boolean;
    matching_transactions_count: number;
};

type BuyerSuggestionResponse = {
    farmer_location: string;
    processors: ProcessorSuggestion[];
};

const steps = [
    {
        id: 1,
        title: 'Resource',
        description: 'What surplus is available?',
        icon: Recycle,
    },
    {
        id: 2,
        title: 'Quantity',
        description: 'How much is available?',
        icon: Package,
    },
    {
        id: 3,
        title: 'Source date',
        description: 'When was it collected?',
        icon: CalendarDays,
    },
    {
        id: 4,
        title: 'Photo',
        description: 'Add a resource photo',
        icon: Camera,
    },
    {
        id: 5,
        title: 'Price',
        description: 'Set your offer price',
        icon: PhilippinePeso,
    },
];

const preservationMethods = [
    {
        value: 'none',
        label: 'No special storage',
        description: 'Kept as-is without special preservation',
    },
    {
        value: 'refrigerated',
        label: 'Refrigerated',
        description: 'Stored inside a refrigerator or cold storage',
    },
    {
        value: 'dried',
        label: 'Dried',
        description: 'Sun-dried or mechanically dried',
    },
    {
        value: 'cool_dry_place',
        label: 'Cool & dry place',
        description: 'Stored away from heat and moisture',
    },
    {
        value: 'other',
        label: 'Other method',
        description: 'Another preservation or storage method',
    },
];

export default function ResourceListingStepper({ resources }: Props): ReactElement {
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [priceRecommendation, setPriceRecommendation] =
        useState<PriceRecommendation | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [priceRecommendationError, setPriceRecommendationError] = useState<
        string | null
    >(null);
    const requestedResourceId = useRef<number | null>(null);
    const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
    const [buyerSuggestions, setBuyerSuggestions] =
        useState<BuyerSuggestionResponse | null>(null);
    const [isLoadingBuyers, setIsLoadingBuyers] = useState(false);
    const [buyerSuggestionError, setBuyerSuggestionError] = useState<string | null>(null);

    const {
        data: form,
        setData,
        post,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm<FormData>({
        agri_resource_id: '',
        quantity: '',
        harvested_at: '',
        preservation_method: '',
        img: null,
        price: '',
    });

    const selectedResource = resources.find(
        (resource) => resource.id === Number(form.agri_resource_id),
    );

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        if (currentStep !== 5 || !selectedResource) {
            return;
        }

        if (requestedResourceId.current === selectedResource.id) {
            return;
        }

        const csrfToken = document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
        )?.content;

        if (!csrfToken) {
            setPriceRecommendationError(
                'The market recommendation could not be requested. Please enter a price manually.',
            );
            return;
        }

        const abortController = new AbortController();
        requestedResourceId.current = selectedResource.id;
        setPriceRecommendation(null);
        setPriceRecommendationError(null);
        setIsLoadingPrice(true);

        void fetch(route('farmer.resource-price-recommendation'), {
            method: 'POST',
            credentials: 'same-origin',
            signal: abortController.signal,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                agri_resource_id: selectedResource.id,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Price recommendation request failed.');
                }

                const result: unknown = await response.json();

                if (!isPriceRecommendation(result)) {
                    throw new Error('Invalid price recommendation response.');
                }

                setPriceRecommendation(result);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    requestedResourceId.current = null;
                    return;
                }

                setPriceRecommendationError(
                    'The AI market guide is temporarily unavailable. You can still enter a price manually.',
                );
            })
            .finally(() => {
                if (!abortController.signal.aborted) {
                    setIsLoadingPrice(false);
                }
            });

        return () => abortController.abort();
    }, [currentStep, selectedResource]);

    const updateField = setData;

    const selectResource = async (resource: AgriResource): Promise<void> => {
        updateField('agri_resource_id', resource.id.toString());
        setIsBuyerModalOpen(true);
        setBuyerSuggestions(null);
        setBuyerSuggestionError(null);
        setIsLoadingBuyers(true);

        const csrfToken = document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
        )?.content;

        if (!csrfToken) {
            setBuyerSuggestionError('Nearby processor suggestions are unavailable right now.');
            setIsLoadingBuyers(false);
            return;
        }

        try {
            const response = await fetch(route('farmer.resource-buyer-suggestions'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ agri_resource_id: resource.id }),
            });

            if (!response.ok) {
                throw new Error('Buyer suggestion request failed.');
            }

            const result: unknown = await response.json();

            if (!isBuyerSuggestionResponse(result)) {
                throw new Error('Invalid buyer suggestion response.');
            }

            setBuyerSuggestions(result);
        } catch {
            setBuyerSuggestionError('Nearby processor suggestions are unavailable right now.');
        } finally {
            setIsLoadingBuyers(false);
        }
    };

    const canContinue = () => {
        switch (currentStep) {
            case 1:
                return Boolean(form.agri_resource_id);

            case 2:
                return Number(form.quantity) > 0;

            case 3:
                return Boolean(
                    form.harvested_at && form.preservation_method,
                );

            case 4:
                return Boolean(form.img);

            case 5:
                return Number(form.price) > 0;

            default:
                return false;
        }
    };

    const nextStep = () => {
        if (!canContinue()) return;

        setCurrentStep((step) => Math.min(step + 1, steps.length));
    };

    const previousStep = () => {
        setCurrentStep((step) => Math.max(step - 1, 1));
    };

    const handleImage = (file: File | null) => {
        updateField('img', file);

        if (!file) {
            setImagePreview(null);
            return;
        }

        setImagePreview(URL.createObjectURL(file));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!canContinue()) return;

        post(route('farmer.resource-listings.store'), {
            forceFormData: true,
            onError: (validationErrors) => {
                if (validationErrors.agri_resource_id) {
                    setCurrentStep(1);
                } else if (validationErrors.quantity) {
                    setCurrentStep(2);
                } else if (
                    validationErrors.harvested_at ||
                    validationErrors.preservation_method
                ) {
                    setCurrentStep(3);
                } else if (validationErrors.img) {
                    setCurrentStep(4);
                }
            },
            onSuccess: () => {
                reset();
                setImagePreview(null);
                setPriceRecommendation(null);
                requestedResourceId.current = null;
                setCurrentStep(1);
            },
        });
    };

    return (
        <div className="mx-auto w-full max-w-3xl">
            {recentlySuccessful && (
                <div
                    role="status"
                    className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800"
                >
                    Your surplus resource listing was posted successfully.
                </div>
            )}

            {Object.keys(errors).length > 0 && (
                <div
                    role="alert"
                    className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                >
                    Please check the highlighted listing details and try again.
                </div>
            )}

            {/* Progress */}
            <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#03592f]">
                            Step {currentStep} of {steps.length}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                            {steps[currentStep - 1].title}
                        </h2>
                    </div>

                    <span className="text-sm font-medium text-gray-500">
                        {Math.round((currentStep / steps.length) * 100)}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-[#6ab225] transition-all duration-300"
                        style={{
                            width: `${(currentStep / steps.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="min-h-[360px] rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:min-h-[420px] sm:p-8">
                    {/* STEP 1 */}
                    {currentStep === 1 && (
                        <StepContainer
                            icon={Recycle}
                            title="What surplus resource is available?"
                            description="Choose the produce, by-product, or reusable farm material you want to list."
                        >
                            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-500">
                                <span>{resources.length} resources available</span>
                                <span>Tap one to select</span>
                            </div>

                            <div className="grid max-h-[52vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain rounded-2xl pr-1 pb-20 sm:grid-cols-3 sm:gap-3">
                                {resources.map((resource) => {
                                    const selected =
                                        form.agri_resource_id ===
                                        resource.id.toString();

                                    return (
                                        <button
                                            key={resource.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => void selectResource(resource)}
                                            className={`relative flex min-h-24 flex-col items-start justify-between gap-3 rounded-2xl border-2 p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-[#6ab225]/15 sm:min-h-28 sm:p-4 ${
                                                selected
                                                    ? 'border-[#6ab225] bg-[#6ab225]/10 shadow-sm'
                                                    : 'border-gray-100 hover:border-[#6ab225]/40 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                                    selected
                                                        ? 'bg-[#6ab225] text-white'
                                                        : 'bg-[#03592f]/5 text-[#03592f]'
                                                }`}
                                            >
                                                <Recycle size={20} />
                                            </div>

                                            {selected && (
                                                <CheckCircle2
                                                    className="absolute right-3 top-3 text-[#6ab225]"
                                                    size={20}
                                                />
                                            )}

                                            <span className="break-words text-sm font-bold leading-5 text-gray-800">
                                                {resource.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </StepContainer>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                        <StepContainer
                            icon={Package}
                            title="How much do you have?"
                            description="Enter the amount of surplus resource available to processors."
                        >
                            <div className="mx-auto max-w-md">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Available quantity
                                </label>

                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.quantity}
                                        onChange={(event) =>
                                            updateField(
                                                'quantity',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Example: 50"
                                        className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 pr-16 text-lg font-semibold outline-none transition focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/10"
                                        autoFocus
                                    />

                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-medium text-gray-400">
                                        kg
                                    </span>
                                </div>

                                <p className="mt-3 text-sm text-gray-500">
                                    Enter the total kilograms you currently
                                    have available.
                                </p>
                            </div>
                        </StepContainer>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                        <StepContainer
                            icon={Warehouse}
                            title="When was it collected?"
                            description="Use the collection, production, or harvest date that best applies."
                        >
                            <div className="space-y-7">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Collection or harvest date
                                    </label>

                                    <input
                                        type="date"
                                        value={form.harvested_at}
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                'harvested_at',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 outline-none transition focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-semibold text-gray-700">
                                        How is the resource being stored?
                                    </label>

                                    <div className="space-y-3">
                                        {preservationMethods.map((method) => {
                                            const selected =
                                                form.preservation_method ===
                                                method.value;

                                            return (
                                                <button
                                                    key={method.value}
                                                    type="button"
                                                    onClick={() =>
                                                        updateField(
                                                            'preservation_method',
                                                            method.value,
                                                        )
                                                    }
                                                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                                                        selected
                                                            ? 'border-[#6ab225] bg-[#6ab225]/5'
                                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                                                            selected
                                                                ? 'border-[#6ab225] bg-[#6ab225]'
                                                                : 'border-gray-300'
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <Check
                                                                size={14}
                                                                className="text-white"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {method.label}
                                                        </p>

                                                        <p className="mt-0.5 text-sm text-gray-500">
                                                            {
                                                                method.description
                                                            }
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </StepContainer>
                    )}

                    {/* STEP 4 */}
                    {currentStep === 4 && (
                        <StepContainer
                            icon={Camera}
                            title="Add a photo"
                            description="A clear photo helps processors assess the available material."
                        >
                            <label className="block cursor-pointer">
                                {imagePreview ? (
                                    <div className="group relative overflow-hidden rounded-2xl">
                                        <img
                                            src={imagePreview}
                                            alt="Resource preview"
                                            className="h-72 w-full object-cover"
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 opacity-0 shadow transition group-hover:opacity-100">
                                                Change photo
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#6ab225]/40 bg-[#6ab225]/5 p-8 text-center transition hover:border-[#6ab225]">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6ab225]/10 text-[#03592f]">
                                            <Camera size={30} />
                                        </div>

                                        <p className="font-bold text-gray-800">
                                            Take or upload a photo
                                        </p>

                                        <p className="mt-1 max-w-xs text-sm text-gray-500">
                                            Make sure the resource is clearly
                                            visible with enough light.
                                        </p>

                                        <span className="mt-5 rounded-xl bg-[#03592f] px-5 py-3 text-sm font-semibold text-white">
                                            Choose Photo
                                        </span>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(event) =>
                                        handleImage(
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>
                        </StepContainer>
                    )}

                    {/* STEP 5 */}
                    {currentStep === 5 && (
                        <StepContainer
                            icon={PhilippinePeso}
                            title="What is your offer price?"
                            description="Enter the price per kilogram, then review the resource listing."
                        >
                            <div className="space-y-7">
                                {isLoadingPrice && (
                                    <div
                                        role="status"
                                        className="animate-pulse rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-200" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-32 rounded bg-emerald-200" />
                                                <div className="h-4 w-52 max-w-full rounded bg-emerald-100" />
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-emerald-800">
                                            Matching prices with your farm location…
                                        </p>
                                    </div>
                                )}

                                {priceRecommendation && (
                                    <PriceRecommendationCard
                                        recommendation={priceRecommendation}
                                        onUsePrice={(price) =>
                                            updateField(
                                                'price',
                                                price.toString(),
                                            )
                                        }
                                    />
                                )}

                                {priceRecommendationError && (
                                    <div
                                        role="alert"
                                        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
                                    >
                                        {priceRecommendationError}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Price per kilogram
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">
                                            ₱
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(event) =>
                                                updateField(
                                                    'price',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className="w-full rounded-2xl border-2 border-gray-200 py-4 pl-11 pr-20 text-xl font-bold outline-none transition focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/10"
                                        />

                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                            / kg
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-[#f7faf7] p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <CheckCircle2
                                            size={20}
                                            className="text-[#6ab225]"
                                        />
                                        <h3 className="font-bold text-gray-900">
                                            Review your listing
                                        </h3>
                                    </div>

                                    <div className="divide-y divide-gray-200">
                                        <ReviewItem
                                            label="Resource"
                                            value={
                                                selectedResource?.name ?? '—'
                                            }
                                        />

                                        <ReviewItem
                                            label="Quantity"
                                            value={`${form.quantity || '—'} kg`}
                                        />

                                        <ReviewItem
                                            label="Collected / harvested"
                                            value={
                                                form.harvested_at || '—'
                                            }
                                        />

                                        <ReviewItem
                                            label="Storage"
                                            value={
                                                preservationMethods.find(
                                                    (method) =>
                                                        method.value ===
                                                        form.preservation_method,
                                                )?.label ?? '—'
                                            }
                                        />

                                        <ReviewItem
                                            label="Price"
                                            value={
                                                form.price
                                                    ? `₱${Number(
                                                          form.price,
                                                      ).toLocaleString()} / kg`
                                                    : '—'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </StepContainer>
                    )}
                </div>

                {/* Navigation */}
                {currentStep > 1 && (
                    <div className="mt-5 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={previousStep}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>

                        {currentStep < steps.length ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={!canContinue()}
                                className="flex items-center gap-2 rounded-xl bg-[#03592f] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#024a27] disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!canContinue() || processing}
                                className="flex items-center gap-2 rounded-xl bg-[#6ab225] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#5d9e20] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Check size={19} />

                                {processing
                                    ? 'Posting...'
                                    : 'Post Resource Listing'}
                            </button>
                        )}
                    </div>
                )}
            </form>

            {isBuyerModalOpen && selectedResource ? (
                <div
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-emerald-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="buyer-suggestions-title"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsBuyerModalOpen(false);
                        }
                    }}
                >
                    <section className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
                        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6ab225]">
                                    Potential target buyers
                                </p>
                                <h2 id="buyer-suggestions-title" className="mt-1 text-xl font-extrabold text-gray-900">
                                    Processors for {selectedResource.name}
                                </h2>
                                <p className="mt-1 text-sm leading-5 text-gray-500">
                                    Ranked by past purchases of this resource, then by distance from your farm.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close processor suggestions"
                                onClick={() => setIsBuyerModalOpen(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <div className="max-h-[56vh] overflow-y-auto px-5 py-4 sm:px-6">
                            {isLoadingBuyers ? (
                                <div className="space-y-3" aria-label="Loading nearby processors">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
                                    ))}
                                </div>
                            ) : buyerSuggestionError ? (
                                <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                                    {buyerSuggestionError} Your selected resource is still saved and you can continue.
                                </div>
                            ) : buyerSuggestions?.processors.length ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-800">
                                        <MapPin className="mt-0.5 shrink-0" size={15} />
                                        Suggestions based on {buyerSuggestions.farmer_location}
                                    </div>
                                    {buyerSuggestions.processors.map((processor) => (
                                        <article key={processor.id} className="rounded-2xl border border-gray-200 p-4 transition hover:border-emerald-300 hover:shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                                                    <Building2 size={20} />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{processor.business_name}</h3>
                                                            <p className="text-sm text-gray-500">{processor.business_type}</p>
                                                        </div>
                                                        {processor.has_bought_resource ? (
                                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                                                                Past buyer
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                                                                Nearby prospect
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-gray-600">
                                                        <MapPin className="mt-0.5 shrink-0 text-[#6ab225]" size={14} />
                                                        <span>{processor.complete_address}{processor.distance_km !== null ? ` · ${processor.distance_km} km away` : ''}</span>
                                                    </p>
                                                    <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                        <Phone className="shrink-0 text-[#6ab225]" size={14} />
                                                        {processor.contact_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                    <p className="px-1 text-[11px] leading-5 text-gray-400">
                                        “Potential buyer” is a suggestion only. Confirm interest, quantity, and price through a transaction message.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-10 text-center">
                                    <Building2 className="mx-auto text-gray-300" size={28} />
                                    <p className="mt-3 font-bold text-gray-800">No processors found yet</p>
                                    <p className="mt-1 text-sm text-gray-500">You can still publish this listing so processors can discover it.</p>
                                </div>
                            )}
                        </div>

                        <footer className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:px-6">
                            <button type="button" onClick={() => setIsBuyerModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200">
                                Keep browsing
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBuyerModalOpen(false);
                                    nextStep();
                                }}
                                className="flex items-center gap-2 rounded-xl bg-[#03592f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#024a27] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/25"
                            >
                                Continue with resource
                                <ArrowRight size={17} />
                            </button>
                        </footer>
                    </section>
                </div>
            ) : null}

            {currentStep === 1 && selectedResource && (
                <div className="fixed inset-x-4 bottom-[88px] z-40 mx-auto max-w-sm md:bottom-6">
                    <button
                        type="button"
                        onClick={nextStep}
                        className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#03592f] px-4 py-3 text-left text-white shadow-xl shadow-emerald-950/25 transition hover:bg-[#024a27] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/30"
                    >
                        <span className="min-w-0">
                            <span className="block text-xs font-medium text-emerald-200">
                                Selected resource
                            </span>
                            <span className="block truncate text-sm font-bold">
                                {selectedResource.name}
                            </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#03592f]">
                            Continue
                            <ArrowRight size={17} />
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

function StepContainer({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof Sprout;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-5 sm:mb-8">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#03592f]/10 text-[#03592f] sm:mb-4 sm:h-12 sm:w-12">
                    <Icon size={24} />
                </div>

                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    {title}
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                    {description}
                </p>
            </div>

            {children}
        </div>
    );
}

function ReviewItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="text-gray-500">{label}</span>

            <span className="text-right font-semibold text-gray-800">
                {value}
            </span>
        </div>
    );
}

function PriceRecommendationCard({
    recommendation,
    onUsePrice,
}: {
    recommendation: PriceRecommendation;
    onUsePrice: (price: number) => void;
}): ReactElement {
    const recommendedPrice = recommendation.recommended_price;
    const minimumPrice = recommendation.minimum_price;
    const maximumPrice = recommendation.maximum_price;
    const hasPrice =
        recommendedPrice !== null &&
        minimumPrice !== null &&
        maximumPrice !== null;
    const isLocationMatch =
        recommendation.match_type === 'nearest_location' ||
        recommendation.match_type === 'location_match';

    return (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#03592f] text-white shadow-sm">
                            <Sparkles size={19} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-[#03592f]">
                                AI market price guide
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Matched with verified market prices
                            </p>
                        </div>
                    </div>

                    {hasPrice && (
                        <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                isLocationMatch
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                            {isLocationMatch
                                ? 'Location matched'
                                : 'Regional fallback'}
                        </span>
                    )}
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/80 p-3 text-sm text-gray-700 ring-1 ring-emerald-100">
                    <MapPin
                        className="mt-0.5 shrink-0 text-[#6ab225]"
                        size={17}
                    />
                    <p className="leading-5">
                        <span className="font-semibold text-gray-900">
                            Based on your location:
                        </span>{' '}
                        {recommendation.farmer_location}
                    </p>
                </div>

                {hasPrice ? (
                    <>
                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Suggested price
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-[#03592f]">
                                    ₱{formatPrice(recommendedPrice)}
                                    <span className="ml-1 text-sm font-semibold text-gray-500">
                                        / kg
                                    </span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onUsePrice(recommendedPrice)}
                                className="rounded-xl bg-[#6ab225] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5d9e20] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/25"
                            >
                                Use suggested price
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                    <TrendingUp size={14} />
                                    Market range
                                </p>
                                <p className="mt-1 text-sm font-bold text-gray-800">
                                    ₱{formatPrice(minimumPrice)}–₱
                                    {formatPrice(maximumPrice)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
                                <p className="text-xs font-semibold text-gray-500">
                                    Market average
                                </p>
                                <p className="mt-1 text-sm font-bold text-gray-800">
                                    {recommendation.average_price !== null
                                        ? `₱${formatPrice(recommendation.average_price)}`
                                        : 'Unavailable'}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
                                <p className="text-xs font-semibold text-gray-500">
                                    Market basis
                                </p>
                                <p className="mt-1 truncate text-sm font-bold text-gray-800">
                                    {recommendation.market_area ?? 'Available markets'}
                                </p>
                                <p className="mt-0.5 text-[11px] text-gray-400">
                                    {recommendation.market_count} market prices
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="mt-4 text-sm leading-6 text-amber-800">
                        {recommendation.message}
                    </p>
                )}

                {hasPrice && (
                    <p className="mt-4 text-xs leading-5 text-gray-500">
                        {recommendation.message} Use this as a guide; you can
                        still enter your own price.
                    </p>
                )}
            </div>
        </div>
    );
}

function formatPrice(value: number): string {
    return value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function isPriceRecommendation(value: unknown): value is PriceRecommendation {
    return (
        typeof value === 'object' &&
        value !== null &&
        'recommended_price' in value &&
        (typeof value.recommended_price === 'number' ||
            value.recommended_price === null) &&
        'average_price' in value &&
        (typeof value.average_price === 'number' ||
            value.average_price === null) &&
        'minimum_price' in value &&
        (typeof value.minimum_price === 'number' ||
            value.minimum_price === null) &&
        'maximum_price' in value &&
        (typeof value.maximum_price === 'number' ||
            value.maximum_price === null) &&
        'farmer_location' in value &&
        typeof value.farmer_location === 'string' &&
        'market_area' in value &&
        (typeof value.market_area === 'string' || value.market_area === null) &&
        'market_count' in value &&
        typeof value.market_count === 'number' &&
        'match_type' in value &&
        typeof value.match_type === 'string' &&
        [
            'nearest_location',
            'location_match',
            'regional_fallback',
            'no_market_data',
        ].includes(value.match_type) &&
        'message' in value &&
        typeof value.message === 'string'
    );
}

function isBuyerSuggestionResponse(value: unknown): value is BuyerSuggestionResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const payload = value as Record<string, unknown>;

    return (
        typeof payload.farmer_location === 'string' &&
        Array.isArray(payload.processors) &&
        payload.processors.every((processor: unknown) => {
            if (typeof processor !== 'object' || processor === null) {
                return false;
            }

            const item = processor as Record<string, unknown>;

            return (
                typeof item.id === 'number' &&
                typeof item.business_name === 'string' &&
                typeof item.business_type === 'string' &&
                typeof item.complete_address === 'string' &&
                typeof item.contact_number === 'string' &&
                (typeof item.distance_km === 'number' || item.distance_km === null) &&
                typeof item.has_bought_resource === 'boolean' &&
                typeof item.matching_transactions_count === 'number'
            );
        })
    );
}
