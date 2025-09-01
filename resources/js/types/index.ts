export type User = {
	id: number
	name: string
	email: string
	avatar?: string
}

export type Group = {
	id: number
	name: string
	owner_id: number
	members: User[]
	created_at: string
	updated_at: string
}

	export type Schedule = {
		id: number
		name: string
		description: string | null
		icon: string | null
		type: 'income' | 'expense'
		period_type: 'daily' | 'weekly' | 'monthly' | 'one_time'
		amount: number
		expected_leftover: number | null
		day_of_month?: number
		day_of_week?: number
		time_of_day?: string
		single_date?: string
		end_date: string | null
		parent_id: number | null
		group_id: number
		created_at: string
		updated_at: string
		parent?: Schedule
	}
