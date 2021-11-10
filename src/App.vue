<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from '@/components/NavBar.vue'
import * as microsoftTeams from '@microsoft/teams-js'
export default {
  components: {
    NavBar
  },
  mounted: function() {
    /*
        For the moment this our configuration page so that we can add the Tab to Teams
        TODO: This should be moved into its own route with Vue Routing later
     */
    microsoftTeams.initialize();
    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
        microsoftTeams.settings.setSettings({
            websiteUrl: process.env.VUE_APP_NGROK_URL,
            contentUrl: process.env.VUE_APP_NGROK_URL,
            entityId: "grayIconTab",
            suggestedDisplayName: "Nextcloud"
        });
        saveEvent.notifySuccess();
    });
    microsoftTeams.settings.setValidityState(true);
    }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
