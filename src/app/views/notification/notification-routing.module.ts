import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PushNotificationSettingsComponent } from './settings/settings.component';
import { SentPushNotificationComponent } from './sent/sent.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'settings',
        pathMatch: 'full',
    },
    {
        path: '',
        data: {
            title: 'Push Notification'
        },
        children: [
            {
                path: 'settings',
                component: PushNotificationSettingsComponent,
                data: {
                    title: 'Send Notification'
                }
            },
            {
                path: 'sent',
                component: SentPushNotificationComponent,
                data: {
                    title: 'Notification list'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NotificationRoutingModule { }
