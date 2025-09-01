<?php

namespace App\Enums;

enum SchedulePeriodType: string
{
    case DAILY = 'daily';
    case WEEKLY = 'weekly';
    case MONTHLY = 'monthly';
    case ONE_TIME = 'one_time';
}
