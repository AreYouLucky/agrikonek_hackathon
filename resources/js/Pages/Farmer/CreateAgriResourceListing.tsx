import ResourceListingStepper from '@/Components/Farmer/forms/ResourceListingStepper';
import FarmersDashboardLayout from '@/Layouts/FarmerDashboardLayout';
import type { ReactElement } from 'react';

type AgriResource = {
    id: number;
    name: string;
};

type Props = {
    resources: AgriResource[];
};

export default function CreateAgriResourceListing({
    resources,
}: Props): ReactElement {
    return (
        <FarmersDashboardLayout title="Create resource listing">
            <ResourceListingStepper resources={resources} />
        </FarmersDashboardLayout>
    );
}
