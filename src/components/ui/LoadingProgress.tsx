import styles from './LoadingProgress.module.scss';

export function LoadingProgress() {
  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div className={styles.shimmer} />
      </div>
    </div>
  );
}
