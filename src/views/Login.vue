<template>
  <div class="login">
    <div>
      <form @submit.prevent="submit">
        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Login",
  components: {},
  data() {
    return {};
  },
  methods: {
    ...mapActions(["initLogin"]),
    async submit() {
      try {
          await this.initLogin();
      } catch (e) {
          console.error(e);
      }
    },
  },
};
</script>
