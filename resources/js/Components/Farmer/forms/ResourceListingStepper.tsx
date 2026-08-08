import { useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Camera,
    Check,
    CheckCircle2,
    Package,
    PhilippinePeso,
    Sprout,
    Warehouse,
} from 'lucide-react';
import { type FormEvent, type ReactElement, useEffect, useState } from 'react';

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

const steps = [
    {
        id: 1,
        title: 'Crop',
        description: 'What are you selling?',
        icon: Sprout,
    },
    {
        id: 2,
        title: 'Quantity',
        description: 'How much is available?',
        icon: Package,
    },
    {
        id: 3,
        title: 'Harvest',
        description: 'When was it harvested?',
        icon: CalendarDays,
    },
    {
        id: 4,
        title: 'Photo',
        description: 'Add a crop photo',
        icon: Camera,
    },
    {
        id: 5,
        title: 'Price',
        description: 'Set your selling price',
        icon: PhilippinePeso,
    },
];

const preservationMethods = [
    {
        value: 'none',
        label: 'No preservation',
        description: 'Freshly harvested and not stored',
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

    const updateField = setData;

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
                    Your crop listing was posted successfully.
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
                            icon={Sprout}
                            title="What crop are you selling?"
                            description="Choose the crop you currently have available."
                        >
                            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-500">
                                <span>{resources.length} crops available</span>
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
                                            onClick={() =>
                                                updateField(
                                                    'agri_resource_id',
                                                    resource.id.toString(),
                                                )
                                            }
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
                                                <Sprout size={20} />
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
                            description="Enter the amount of crop available for buyers."
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
                            title="Tell us about the harvest"
                            description="This helps us understand how fresh your crop is."
                        >
                            <div className="space-y-7">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        When was it harvested?
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
                                        How is the crop being stored?
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
                            description="A clear photo helps buyers know what your crop looks like."
                        >
                            <label className="block cursor-pointer">
                                {imagePreview ? (
                                    <div className="group relative overflow-hidden rounded-2xl">
                                        <img
                                            src={imagePreview}
                                            alt="Crop preview"
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
                                            Make sure the crop is clearly
                                            visible and there is enough light.
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
                            title="How much are you selling it for?"
                            description="Enter your price per kilogram, then review your listing."
                        >
                            <div className="space-y-7">
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
                                            label="Crop"
                                            value={
                                                selectedResource?.name ?? '—'
                                            }
                                        />

                                        <ReviewItem
                                            label="Quantity"
                                            value={`${form.quantity || '—'} kg`}
                                        />

                                        <ReviewItem
                                            label="Harvested"
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
                                    : 'Post Crop Listing'}
                            </button>
                        )}
                    </div>
                )}
            </form>

            {currentStep === 1 && selectedResource && (
                <div className="fixed inset-x-4 bottom-[88px] z-40 mx-auto max-w-sm md:bottom-6">
                    <button
                        type="button"
                        onClick={nextStep}
                        className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#03592f] px-4 py-3 text-left text-white shadow-xl shadow-emerald-950/25 transition hover:bg-[#024a27] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/30"
                    >
                        <span className="min-w-0">
                            <span className="block text-xs font-medium text-emerald-200">
                                Selected crop
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
