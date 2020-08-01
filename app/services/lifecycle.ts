import {
    on,
    launchEvent,
    suspendEvent,
    resumeEvent,
    displayedEvent,
    orientationChangedEvent,
    exitEvent,
    lowMemoryEvent,
    uncaughtErrorEvent,
    discardedErrorEvent,
} from "tns-core-modules/application";

import DiscoverStation from "./discover-station";

export default function (discoverStation: () => DiscoverStation) {
    on(launchEvent, (args) => {
        if (args.android) {
            console.log("lifecycle: launched android: " + args.android + ".");
        } else if (args.ios !== undefined) {
            console.log("lifecycle: launched ios: " + args.ios);
        }

        return null;
    });

    on(suspendEvent, (args) => {
        if (args.android) {
            console.log("lifecycle: suspend: " + args.android);
        } else if (args.ios) {
            console.log("lifecycle: suspend: " + args.ios);
        }

        if (discoverStation().started()) {
            console.log("lifecycle: stopping discovery");
            discoverStation().stopServiceDiscovery();
        }

        return null;
    });

    on(resumeEvent, (args) => {
        if (args.android) {
            console.log("lifecycle: resume: " + args.android);
        } else if (args.ios) {
            console.log("lifecycle: resume: " + args.ios);
        }

        if (!discoverStation().started()) {
            console.log("lifecycle: starting discovery");
            discoverStation().startServiceDiscovery();
        }

        return null;
    });

    on(displayedEvent, (args) => {
        console.log("lifecycle: displayedEvent");
    });

    on(orientationChangedEvent, (args) => {
        console.log("lifecycle: orientationChangedEvent", args.newValue);
    });

    on(exitEvent, (args) => {
        if (args.android) {
            if (args.android.isFinishing()) {
                console.log("lifecycle: exit: " + args.android + " is exiting");
            } else {
                console.log("lifecycle: exit: " + args.android + " is restarting");
            }
        } else if (args.ios) {
            console.log("lifecycle: exit: " + args.ios);
        }
    });

    on(lowMemoryEvent, (args) => {
        if (args.android) {
            console.log("lifecycle: lowMemory: " + args.android);
        } else if (args.ios) {
            console.log("lifecycle: lowMemory: " + args.ios);
        }
    });

    on(uncaughtErrorEvent, (args) => {
        console.log("lifecycle: error: " + args.error);
    });

    on(discardedErrorEvent, (args) => {
        console.log("lifecycle: discarded: " + args);
    });
}
