import { Routes } from '@angular/router';
import { CreateUi } from './create/create-ui/create-ui';
import { VetoUi } from './veto/veto-ui/veto-ui';
import { HomeUi } from './home/home/home-ui';
import { Faq } from './global/faq/faq';
import { About } from './global/about/about';
import { Help } from './global/help/help';
import { ObserveUi } from './observe/observe-ui/observe-ui';
import { AdminUi } from './admin/admin-ui/admin-ui';
import { ModeSelection } from './create/create-ui/components/mode-selection/mode-selection';

const basePageTitle = "Veto System";

export const routes: Routes = [
    {path: 'new', component: CreateUi, title: basePageTitle},
    {path: 'new/:id', component: ModeSelection, title: basePageTitle},
    {path: 'admin/:id', component: AdminUi, title: basePageTitle},
    {path: 'veto', component: VetoUi, title: basePageTitle},
    {path: 'veto/:attendee/:id', component: VetoUi, title: basePageTitle},
    {path: 'observe/:id', component: ObserveUi, title: basePageTitle},
    {path: 'faq', component: Faq, title: basePageTitle},
    {path: 'help', component: Help, title: basePageTitle},
    {path: 'about', component: About, title: basePageTitle},
    {path: '**', component: HomeUi, title: basePageTitle},
];
