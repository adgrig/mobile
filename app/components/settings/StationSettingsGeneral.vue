<template>
    <Page class="page" actionBarHidden="true" @loaded="onPageLoaded">
        <GridLayout rows="*,70">
            <ScrollView row="0">
                <StackLayout class="p-t-10">
                    <ScreenHeader :title="_L('general')" :subtitle="station.name" :onBack="goBack" :canNavigateSettings="false" />

                    <!-- menu -->
                    <StackLayout class="m-t-5">
                        <Label
                            v-for="(option, i) in menuOptions"
                            :key="option"
                            :class="'menu-text size-18 ' + (i == menuOptions.length - 1 ? 'bottom-border' : '')"
                            :text="option"
                            textWrap="true"
                            @tap="selectFromMenu"
                        ></Label>
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <ScreenFooter row="1" :station="station" active="stations" />
        </GridLayout>
    </Page>
</template>

<script lang="ts">
import Vue from "vue";
import routes from "../../routes";

import ScreenHeader from "../ScreenHeader.vue";
import ScreenFooter from "../ScreenFooter.vue";
import StationName from "./StationSettingsName.vue";
import CaptureSchedule from "./StationSettingsCaptureSchedule.vue";

export default Vue.extend({
    data() {
        return {
            menuOptions: [_L("stationName"), _L("dataCaptureSchedule")],
        };
    },
    props: {
        stationId: {
            required: true,
            type: Number,
        },
        station: {
            required: true,
            type: Object,
        },
    },
    components: {
        ScreenHeader,
        ScreenFooter,
        StationName,
        CaptureSchedule,
    },
    methods: {
        onPageLoaded(this: any, args) {},
        selectFromMenu(this: any, event) {
            const cn = event.object.className;
            event.object.className = cn + " pressed";
            setTimeout(() => {
                event.object.className = cn;
            }, 500);

            switch (event.object.text) {
                case _L("stationName"):
                    return this.goToName();
                case _L("dataCaptureSchedule"):
                    return this.goToSchedule();
            }
        },
        goToName(this: any) {
            return this.$navigateTo(StationName, {
                props: {
                    stationId: this.stationId,
                    station: this.station,
                },
            });
        },
        goToSchedule(this: any) {
            return this.$navigateTo(CaptureSchedule, {
                props: {
                    stationId: this.stationId,
                    station: this.station,
                },
            });
        },
        goBack(this: any, ev) {
            // Change background color when pressed
            let cn = ev.object.className;
            ev.object.className = cn + " pressed";
            setTimeout(() => {
                ev.object.className = cn;
            }, 500);

            return this.$navigateTo(routes.stationSettings, {
                props: {
                    stationId: this.stationId,
                    station: this.station,
                },
                transition: {
                    name: "slideRight",
                    duration: 250,
                    curve: "linear",
                },
            });
        },
    },
});
</script>
<style scoped lang="scss">
@import "~/_app-variables";

.menu-text {
    padding-left: 5;
    padding-top: 20;
    padding-bottom: 20;
    margin-left: 10;
    margin-right: 10;
    border-color: $fk-gray-lighter;
    border-top-width: 1;
}
.bottom-border {
    border-bottom-color: $fk-gray-lighter;
    border-bottom-width: 1;
}
</style>
