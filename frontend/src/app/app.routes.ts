import { Routes } from '@angular/router';
import { CreateUi } from './create/create-ui/create-ui';
import { VetoUi } from './veto/veto-ui/veto-ui';
import { ModeSelection } from './shared-components/mode-selection/mode-selection';
import { HomeUi } from './home/home/home-ui';
import { Faq } from './global/faq/faq';
import { About } from './global/about/about';
import { Help } from './global/help/help';
import { ObserveUi } from './observe/observe-ui/observe-ui';


export const routes: Routes = [
    {path: 'new', component: CreateUi},
    {path: 'new/:id', component: ModeSelection},
    {path: 'veto', component: VetoUi},
    {path: 'veto/:attendee/:id', component: VetoUi},
    {path: 'observe/:id', component: ObserveUi},
    {path: 'faq', component: Faq},
    {path: 'help', component: Help},
    {path: 'about', component: About},
    {path: '**', component: HomeUi},
];
