<template>
  <form v-if="event.name" @submit.prevent="onSubmit">
    <h2>Register for {{ event.name }}</h2>
    <div class="row">
      <div class="col">
        <label>The Email to contact you about the application</label>
        <input type="email" v-model="email" class="full-width-block" placeholder="you@email.com" required />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>This form is to register the project for <em>all project members</em>. Each project should only be registered once, by one person. We will contact whoever registers this project soon after registration telling them how to edit the project details well before the event.</p>
      </div>
    </div>
    <div class="row row-double-margin">
      <div class="col text-center">
        <button type="submit" class="btn btn-primary">Next Step – Project Details</button>
      </div>
    </div>
  </form>
</template>

<script>
  import Cookie from 'js-cookie';
  import AuthService from '@/auth/service';
  import UserService from '@/user/service';
  import EventService from '@/event/service';

  export default {
    name: 'Auth',
    props: {
      eventId: {
        required: true,
        type: String,
      },
    },
    data() {
      return {
        email: null,
        event: {},
      };
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventId)).body;
      },
      async onSubmit() {
        try {
          await AuthService.auth(this.email);
          this.$router.push({ name: 'AuthEmail' });
        } catch (e) {
          const user = (await UserService.create(this.email)).body;
          Cookie.set('authToken', user.auth.token);
          this.$ga.event({
            eventCategory: 'ProjectRegistration',
            eventAction: 'NewUserAuth',
            eventLabel: this.eventId,
          });
          this.$router.push({ name: 'CreateProject', params: { eventId: this.eventId } });
        }
      },
    },
    created() {
      this.fetchEvent();
    },
  };
</script>
