export interface ETLConfigRow {
	// ===== REQUIRED =====
	id: number;

	layer: string;
	source_table_name: string;
	target_table_name: string;
	source_table_full_name: string;
	target_table_full_name: string;
	enabled: boolean;
	target_table_ddl: string;

	// ===== OPTIONAL =====
	target_partition_spec?: string | null;

	primary_key_columns?: string | null;
	order_by_column?: string | null;
	order_by_direction?: string | null;

	transform_sql?: string | null;
	transform_class?: string | null;

	batch_size?: number | null;
	processing_interval_minutes?: number | null;

	processing_mode?: string | null;

	last_processed_snapshot_id?: number | null;
	last_processed_timestamp?: string | null;
	last_processed_watermark?: string | null;

	last_run_at?: string | null;
	last_run_status?: string | null;
	last_run_error?: string | null;
	last_run_records_processed?: number | null;

	depends_on_tables?: string | null;
	description?: string | null;
	tags?: string | null;

	created_at?: string | null;
	updated_at?: string | null;

	created_by?: string | null;
	updated_by?: string | null;
};