<template>
    <GridLayout rows="auto,auto,auto,auto" class="m-t-20">
        <Image src="~/images/TI_8-B.jpg" v-if="image" />
        <Label row="0" :text="_L('connectAStation')" class="m-x-10 m-t-30 m-b-10 text-center bold dark size-20" />
        <Label row="1" :text="_L('addStationInstruction')" class="text-center size-18 instruction" textWrap="true" />
        <Button row="2" class="btn btn-primary btn-padded m-y-20" :text="_L('addStation')" @tap="goToAddStation"></Button>
    </GridLayout>
</template>
<script lang="ts">
import Vue from "vue";
import routes from "@/routes";

export default Vue.extend({
    name: "NoStationsWannaAdd",
    props: {
        image: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        goToAddStation(this: any) {
            return this.$navigateTo(routes.onboarding.start);
        },
    },
});
</script>

<style scoped lang="scss">
@import "~/_app-variables";

.dark {
    color: $fk-primary-black;
}
.instruction {
    color: $fk-primary-black;
    margin-left: 25;
    margin-right: 25;
    margin-bottom: 20;
    line-height: 4;
}
</style>
