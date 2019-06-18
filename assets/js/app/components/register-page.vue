<template>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Register</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form
                    ref="form"
                    v-model="valid"
                    lazy-validation>
                  <v-text-field
                      prepend-icon="person"
                      name="login"
                      label="Login"
                      type="text"
                      v-model="username"
                      :rules="usernameRules"
                  ></v-text-field>
                  <v-text-field
                      id="password"
                      prepend-icon="lock"
                      name="password"
                      label="Password"
                      type="password"
                      v-model="password"
                      :rules="passwordRules"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="submit">Register</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
</template>

<script>
export default {
    data(){
        return {
            valid: true,
            username : '',
            usernameRules : [
                v => !!v || 'username is required',
                v => (v && v.length >= 5 && v.length <= 10) || 'Username must be between 5 and 10 characters'
            ],
            password : '',
            passwordRules : [
                v => !!v || 'password is required',
                v => (v && v.length >= 5) || 'Password must be more than 5'
            ]
        }
    },
    methods : {
        submit(event){
            event.preventDefault()
            this.valid = true;
            if (this.$refs.form.validate()) {
                this.$http.post('http://127.0.0.1:8888/api/register', {
                    username: this.username,
                    password: this.password
                })
                .then(response => {
                    localStorage.setItem('user',JSON.stringify(response.data.user))
                    localStorage.setItem('jwt',response.data.token)

                    if (localStorage.getItem('jwt') != null) {
                        this.$router.push('/')
                    }
                }, err => {
                    console.log(err);
                });
            }
        }
    }
}
</script>
