<template>
    <Page class="page plain" actionBarHidden="true" @loaded="onPageLoaded">
        <ScrollView>
            <FlexboxLayout flexDirection="column" justifyContent="space-between">
                <GridLayout rows="auto" columns="15*,70*,15*">
                    <StackLayout row="0" col="0" class="round-bkgd" verticalAlignment="top" @tap="goBack">
                        <Image width="21" v-show="!isEditingName" src="~/images/Icon_Backarrow.png"></Image>
                    </StackLayout>
                    <Image
                        row="0"
                        col="0"
                        class="m-10"
                        width="17"
                        v-show="isEditingName"
                        @tap="cancelRename"
                        src="~/images/Icon_Close.png"
                    ></Image>
                    <Label
                        row="0"
                        col="1"
                        class="title m-y-10 text-center module-name"
                        :text="module.name"
                        v-show="!isEditingName"
                        textWrap="true"
                    ></Label>
                    <!-- Edit name form -->
                    <StackLayout row="0" col="1" id="module-name-field" class="input-field m-y-10 text-left">
                        <FlexboxLayout>
                            <TextField
                                class="input"
                                :isEnabled="true"
                                keyboardType="name"
                                autocorrect="false"
                                autocapitalizationType="none"
                                horizontalAlignment="left"
                                v-model="module.name"
                                v-show="isEditingName"
                                returnKeyType="next"
                                @blur="checkName"
                            ></TextField>
                            <Label
                                class="size-10 char-count"
                                horizontalAlignment="right"
                                :text="module.name.length"
                                v-show="isEditingName"
                            ></Label>
                        </FlexboxLayout>
                        <StackLayout class="spacer-top" id="name-field-spacer"></StackLayout>
                        <Label
                            class="validation-error"
                            id="no-name"
                            horizontalAlignment="left"
                            :text="_L('nameRequired')"
                            textWrap="true"
                            :visibility="noName ? 'visible' : 'collapsed'"
                        ></Label>
                        <Label
                            class="validation-error"
                            id="name-too-long"
                            horizontalAlignment="left"
                            :text="_L('nameOver40')"
                            textWrap="true"
                            :visibility="nameTooLong ? 'visible' : 'collapsed'"
                        ></Label>
                        <Label
                            class="validation-error"
                            id="name-not-printable"
                            horizontalAlignment="left"
                            :text="_L('nameNotPrintable')"
                            textWrap="true"
                            :visibility="nameNotPrintable ? 'visible' : 'collapsed'"
                        ></Label>
                    </StackLayout>
                    <!-- end edit name form -->
                    <Image
                        row="0"
                        col="2"
                        class="m-10"
                        width="14"
                        v-show="!isEditingName"
                        @tap="toggleRename"
                        src="~/images/Icon_Edit.png"
                    ></Image>
                    <Image
                        row="0"
                        col="2"
                        class="m-10"
                        width="17"
                        v-show="isEditingName"
                        @tap="saveModuleName"
                        src="~/images/Icon_Save.png"
                    ></Image>
                </GridLayout>

                <!-- Data capture interval -->
                <GridLayout rows="auto,auto,auto,auto" columns="*,*" class="m-x-10 m-y-10">
                    <Label row="0" colSpan="4" class="size-20" :text="_L('dataCaptureSchedule')"></Label>
                    <Label row="1" colSpan="2" class="size-14 m-y-5" textWrap="true" :text="_L('dataCaptureNotice')"></Label>
                    <TextField
                        row="2"
                        col="0"
                        class="input interval-input"
                        id="interval-field"
                        :isEnabled="true"
                        verticalAligment="bottom"
                        keyboardType="name"
                        autocorrect="false"
                        autocapitalizationType="none"
                        v-model="displayInterval"
                        @blur="saveInterval"
                    ></TextField>
                    <StackLayout row="2" col="1" id="drop-down-container">
                        <DropDown
                            :items="timeUnits"
                            @selectedIndexChanged="onSelectedIndexChanged"
                            backgroundColor="#F4F5F7"
                            class="drop-down"
                            :selectedIndex="currentUnit"
                        ></DropDown>
                    </StackLayout>
                    <StackLayout row="3" col="0">
                        <Label
                            class="validation-error"
                            id="no-interval"
                            horizontalAlignment="left"
                            :text="_L('intervalRequired')"
                            textWrap="true"
                            :visibility="noInterval ? 'visible' : 'collapsed'"
                        ></Label>
                        <Label
                            class="validation-error"
                            id="interval-not-numeric"
                            horizontalAlignment="left"
                            :text="_L('intervalNotNumber')"
                            textWrap="true"
                            :visibility="intervalNotNumber ? 'visible' : 'collapsed'"
                        ></Label>
                    </StackLayout>
                </GridLayout>
                <!-- end: Data capture interval -->

                <!-- footer -->
                <ScreenFooter :station="station" active="stations" />
            </FlexboxLayout>
        </ScrollView>
    </Page>
</template>

<script lang="ts">
import Vue from "vue";
import routes from "@/routes";
import Services from "@/services/services";
import ScreenFooter from "../ScreenFooter.vue";

const dbInterface = Services.Database();

export default Vue.extend({
    data() {
        return {
            currentUnit: 0,
            displayInterval: "",
            isEditingName: false,
            noName: false,
            nameNotPrintable: false,
            nameTooLong: false,
            noInterval: false,
            intervalNotNumber: false,
            module: {
                name: "",
                origName: "",
            },
            timeUnits: [_L("seconds"), _L("minutes"), _L("hours"), _L("days"), _L("weeks")],
        };
    },
    props: ["moduleId", "station", "origin"],
    components: {
        ScreenFooter,
    },
    methods: {
        onPageLoaded(this: any, args) {
            this.page = args.object;

            let user = this.$portalInterface.getCurrentUser();
            this.userName = user.name;

            dbInterface.getModule([this.moduleId]).then((module) => {
                this.module = module[0];
                this.module.origName = this.module.name;
                this.origInterval = this.module.interval;
                this.convertFromSeconds();
                // save original time unit created in convertFromSeconds()
                this.origUnit = this.currentUnit;
            });
        },
        goBack(this: any, event) {
            let cn = event.object.className;
            event.object.className = cn + " pressed";
            setTimeout(() => {
                event.object.className = cn;
            }, 500);

            // TODO: handle history better
            if (this.origin == "detail") {
                /*
                this.$navigateTo(routes.module, {
                    props: {
                        moduleId: this.module.id,
                        station: this.station,
                    },
                });
				*/
            }
            if (this.origin == "settings") {
                this.$navigateTo(routes.stationSettings, {
                    props: {
                        station: this.station,
                    },
                });
            }
        },
        toggleRename(this: any) {
            this.isEditingName = true;
        },
        checkName(this: any) {
            // reset these first
            this.noName = false;
            this.nameNotPrintable = false;
            this.nameTooLong = false;
            // then check
            this.noName = !this.module.name || this.module.name.length == 0;
            if (this.noName) {
                return false;
            }
            let matches = this.module.name.match(/^[ \w~!@#$%^&*()-.']*$/);
            this.nameNotPrintable = !matches || matches.length == 0;
            this.nameTooLong = this.module.name.length > 40;
            return !this.nameTooLong && !this.nameNotPrintable;
        },
        saveModuleName(this: any) {
            this.isEditingName = false;
            let valid = this.checkName();
            if (valid && this.module.origName != this.module.name) {
                dbInterface.setModuleName(this.module);
                let configChange = {
                    moduleId: this.module.id,
                    before: this.module.origName,
                    after: this.module.name,
                    affectedField: "name",
                    author: this.userName,
                };
                dbInterface.recordModuleConfigChange(configChange);
                this.module.origName = this.module.name;
            }
        },
        cancelRename(this: any) {
            this.isEditingName = false;
            this.noName = false;
            this.nameNotPrintable = false;
            this.nameTooLong = false;
            this.module.name = this.module.origName;
        },
        convertFromSeconds(this: any) {
            let displayValue = this.module.interval;
            // this.currentUnit is an index into timeUnits:
            // timeUnits: ["seconds", "minutes", "hours", "days", "weeks"]
            if (this.module.interval < 60) {
                // seconds
                this.currentUnit = 0;
            } else if (this.module.interval < 3600) {
                // minutes
                this.currentUnit = 1;
                displayValue /= 60;
                displayValue = Math.round(displayValue);
            } else if (this.module.interval < 86400) {
                // hours
                this.currentUnit = 2;
                displayValue /= 3600;
                displayValue = Math.round(displayValue);
            } else if (this.module.interval < 604800) {
                // days
                this.currentUnit = 3;
                displayValue /= 86400;
                displayValue = Math.round(displayValue);
            } else {
                // weeks
                this.currentUnit = 4;
                displayValue /= 604800;
                displayValue = displayValue.toFixed(1);
            }
            this.displayInterval = displayValue;
        },
        convertToSeconds(this: any) {
            switch (this.currentUnit) {
                case 0:
                    this.module.interval = this.displayInterval;
                    break;
                case 1:
                    this.module.interval = this.displayInterval * 60;
                    break;
                case 2:
                    this.module.interval = this.displayInterval * 3600;
                    break;
                case 3:
                    this.module.interval = this.displayInterval * 86400;
                    break;
                case 4:
                    this.module.interval = this.displayInterval * 604800;
                    break;
                default:
                    break;
            }
        },
        checkInterval(this: any) {
            // reset these first
            this.noInterval = false;
            this.intervalNotNumber = false;
            // then check
            this.noInterval = !this.displayInterval || this.displayInterval == 0 || this.displayInterval.length == 0;
            if (this.noInterval) {
                return false;
            }
            this.intervalNotNumber = isNaN(this.displayInterval);
            return !this.intervalNotNumber;
        },
        saveInterval(this: any) {
            let valid = this.checkInterval();
            if (valid) {
                this.convertToSeconds(); // assigns displayInterval to this.module.interval
                if (this.origInterval != this.module.interval) {
                    dbInterface.setModuleInterval(this.module);
                    let configChange = {
                        moduleId: this.module.id,
                        before: this.origInterval,
                        after: this.module.interval,
                        affectedField: "interval",
                        author: this.userName,
                    };
                    dbInterface.recordModuleConfigChange(configChange);
                    this.origInterval = this.module.interval;
                    this.origUnit = this.currentUnit;
                }
            }
        },
        onSelectedIndexChanged(this: any, event) {
            // console.log(event.oldIndex, event.newIndex)
            this.currentUnit = event.newIndex;
            this.saveInterval();
        },
    },
});
</script>

<style scoped lang="scss">
@import "~/_app-variables";

#module-name-field {
    width: 225;
    font-size: 16;
    color: $fk-primary-black;
}

#module-name-field .input {
    width: 195;
    border-bottom-color: $fk-primary-black;
    border-bottom-width: 1;
    padding-top: 3;
    padding-bottom: 2;
    padding-left: 0;
    padding-right: 0;
    margin: 0;
}

#module-name-field .char-count {
    width: 25;
    margin-top: 15;
    margin-left: 5;
}

.module-name {
    width: 195;
}

.validation-error {
    width: 195;
    font-size: 12;
    color: $fk-tertiary-red;
    border-top-color: $fk-tertiary-red;
    border-top-width: 2;
    padding-top: 5;
}

.interval-input {
    font-size: 18;
    width: 50%;
    padding: 5;
    border-bottom-width: 1;
    border-bottom-color: $fk-primary-black;
}
</style>
