<template>
  <div>
    <div class="row">
      <div class="col text-center">
        <h1>You're coming to {{ event.name }}!</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>Congratulations, you've succesfully registered "{{ project.name }}" for {{ event.name }}. It's a full day of fun on {{ eventDateFormatted }} in the {{ event.location }}. For any more information on the event check out <a href="https://www.coolestprojects.org">www.coolestprojects.org</a>.
The next step, have fun and keep building your project!</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>We've sent you a confirmation email and we'll be in contact soon with further details.</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>Anyone who is part of a project does not need a ticket. For anyone else they need to get a ticket <a href="https://ti.to/coderdojo-coolest-projects/coolest-projects-international-2018">here</a> when they become available.</p>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import EventService from '@/event/service';
  import ProjectService from '@/project/service';

  export default {
    name: 'CreateProjectCompleted',
    props: {
      eventId: {
        type: String,
        required: true,
      },
      projectId: {
        type: String,
        required: true,
      },
      _event: {
        type: Object,
      },
      _project: {
        type: Object,
      },
    },
    data() {
      return {
        event: {
          name: 'test',
        },
        project: {},
      };
    },
    computed: {
      eventDateFormatted() {
        return moment.utc(this.event.date).format('MMM Do');
      },
    },
    methods: {
      async fetchEvent() {
        this.event = (await EventService.get(this.eventId)).body;
      },
      async fetchProject() {
        this.project = (await ProjectService.get(this.eventId, this.projectId)).body;
      },
    },
    created() {
      if (this._event) {
        this.event = this._event;
      } else {
        this.fetchEvent();
      }
      if (this._project) {
        this.project = this._project;
      } else {
        this.fetchProject();
      }
    },
  };
</script>
