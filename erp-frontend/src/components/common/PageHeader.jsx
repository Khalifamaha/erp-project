export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}