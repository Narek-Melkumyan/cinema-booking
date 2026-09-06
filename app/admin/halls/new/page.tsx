import Link from "next/link";

import styles from "../../admin.module.css";
import { createHall } from "../actions";

export default function NewHallPage() {
    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Add Hall</h1>

                    <p>
                        Create a cinema hall and generate
                        its seats.
                    </p>
                </div>
            </div>

            <form
                action={createHall}
                className={styles.formPanel}
            >
                <div className={styles.formSection}>
                    <div className={styles.formGrid}>
                        <div
                            className={
                                styles.formGroupFull
                            }
                        >
                            <label>Hall name</label>

                            <input
                                name="name"
                                placeholder="Hall 1"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Rows</label>

                            <input
                                name="rows"
                                type="number"
                                min="1"
                                placeholder="8"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                Seats per row
                            </label>

                            <input
                                name="seatsPerRow"
                                type="number"
                                min="1"
                                placeholder="12"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Link
                        href="/admin/halls"
                        className={
                            styles.secondaryButton
                        }
                    >
                        Cancel
                    </Link>

                    <button
                        className={
                            styles.primaryButton
                        }
                    >
                        Create Hall
                    </button>
                </div>
            </form>
        </>
    );
}